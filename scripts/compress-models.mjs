#!/usr/bin/env node
/**
 * Compresses source GLBs from models-src/ into public/models/.
 *
 * Prerequisites:
 * - `npm install`
 * - KTX-Software 4.3+ for Basis/KTX2 texture encoding. The script looks for
 *   `KTX_BIN`, `ktx` on PATH, or `node_modules/.cache/ktx-software/bin/ktx`.
 *   GLTF-Transform's ETC1S/UASTC commands call this encoder internally.
 *
 * Compression policy:
 * - Source topology is preserved. No decimation or simplification is applied.
 * - Geometry uses Draco with high quantization precision.
 * - Textures default to UASTC KTX2 with no resize, mild RDO, and Zstandard,
 *   balancing clean gradients and surface detail against the full model set size.
 *   Per-model overrides can tune or bypass texture compression when needed.
 */

import { execFile } from 'node:child_process';
import { access, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, inspect, weld } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const DEFAULTS = {
  srcDir: path.join(repoRoot, 'models-src'),
  outDir: path.join(repoRoot, 'public/models'),
  contentDir: path.join(repoRoot, 'content/creatures'),
  updateContent: true,
  keepTemp: false,
  jobs: Math.min(Math.max(os.cpus().length, 1), 4),
  texture: {
    mode: 'uastc',
    level: 2,
    rdo: true,
    rdoLambda: 0.75,
    zstd: 18,
    quality: 220,
    compression: 4,
    rdoThreshold: 1.0,
  },
  draco: {
    method: 'edgebreaker',
    encodeSpeed: 5,
    decodeSpeed: 5,
    quantizePosition: 16,
    quantizeNormal: 12,
    quantizeTexcoord: 14,
    quantizeGeneric: 14,
    quantizeColor: 8,
    quantizationVolume: 'mesh',
  },
};

const MODEL_OVERRIDES = {
  // Example:
  // 'yellow-boxfish.glb': {
  //   texture: { mode: 'source' },
  // },
};

const CLOUDFLARE_PAGES_FILE_LIMIT_BYTES = 25 * 1024 * 1024;

const args = parseArgs(process.argv.slice(2));
const options = {
  ...DEFAULTS,
  ...args,
  texture: { ...DEFAULTS.texture, ...args.texture },
  draco: { ...DEFAULTS.draco, ...args.draco },
};

await main();

async function main() {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const ktxBin = await resolveKtxBinary();
  const gltfTransformBin = path.join(repoRoot, 'node_modules/.bin/gltf-transform');
  await assertExecutable(gltfTransformBin, 'Missing local gltf-transform binary. Run `npm install` first.');

  await mkdir(options.outDir, { recursive: true });

  const allModels = (await readdir(options.srcDir))
    .filter((name) => name.endsWith('.glb'))
    .sort((a, b) => a.localeCompare(b));
  const selectedModels = options.models?.length
    ? allModels.filter((name) => options.models.includes(name) || options.models.includes(name.replace(/\.glb$/, '')))
    : allModels;

  if (!selectedModels.length) {
    throw new Error(`No .glb files found in ${path.relative(repoRoot, options.srcDir)}.`);
  }

  const tempDir = await fsTempDir();
  const rows = [];
  const contentUpdates = new Map();

  try {
    for (const filename of selectedModels) {
      const modelOptions = mergeModelOptions(options, MODEL_OVERRIDES[filename]);
      const srcPath = path.join(options.srcDir, filename);
      const preparedPath = path.join(tempDir, `${filename}.prepared.glb`);
      const texturePath = path.join(tempDir, `${filename}.ktx2.glb`);
      const outPath = path.join(options.outDir, filename);

      const beforeBytes = (await stat(srcPath)).size;
      const sourceDoc = await io.read(srcPath);
      const beforeStats = getModelStats(sourceDoc);

      await sourceDoc.transform(
        dedup(),
        weld(),
      );

      if (modelOptions.texture.mode === 'source') {
        await sourceDoc.transform(draco(modelOptions.draco));
        await io.write(outPath, sourceDoc);
      } else {
        await io.write(preparedPath, sourceDoc);

        await runTextureCompression({
          gltfTransformBin,
          ktxBin,
          input: preparedPath,
          output: texturePath,
          texture: modelOptions.texture,
          jobs: modelOptions.jobs,
        });

        const textureDoc = await io.read(texturePath);
        await textureDoc.transform(draco(modelOptions.draco));
        await io.write(outPath, textureDoc);
      }

      const afterBytes = (await stat(outPath)).size;
      const afterDoc = await io.read(outPath);
      const afterStats = getModelStats(afterDoc);
      const textureLabel = describeTextureSettings(modelOptions.texture);

      rows.push({
        filename,
        textureLabel,
        beforeBytes,
        afterBytes,
        savedBytes: beforeBytes - afterBytes,
        beforeStats,
        afterStats,
      });

      contentUpdates.set(`/models/${filename}`, {
        fileBytes: afterBytes,
        triangleCount: afterStats.triangleCount,
        textureCount: afterStats.textureCount,
      });
    }

    if (options.updateContent) {
      await updateCreatureMetadata(options.contentDir, contentUpdates);
    }
  } finally {
    if (!options.keepTemp) {
      await rm(tempDir, { recursive: true, force: true });
    } else {
      console.log(`Kept temp files: ${tempDir}`);
    }
  }

  printReport(rows);
}

function parseArgs(argv) {
  const parsed = { texture: {}, draco: {} };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`Missing value for ${arg}.`);
      return argv[i];
    };

    switch (arg) {
      case '--src':
        parsed.srcDir = path.resolve(repoRoot, next());
        break;
      case '--out':
        parsed.outDir = path.resolve(repoRoot, next());
        break;
      case '--content':
        parsed.contentDir = path.resolve(repoRoot, next());
        break;
      case '--models':
        parsed.models = next().split(',').map((value) => value.trim()).filter(Boolean);
        break;
      case '--texture-mode':
        parsed.texture.mode = next();
        break;
      case '--quality':
        parsed.texture.quality = Number(next());
        break;
      case '--compression':
        parsed.texture.compression = Number(next());
        break;
      case '--rdo-threshold':
        parsed.texture.rdoThreshold = Number(next());
        break;
      case '--no-rdo':
        parsed.texture.rdo = false;
        break;
      case '--uastc-level':
        parsed.texture.level = Number(next());
        break;
      case '--uastc-rdo':
        parsed.texture.rdo = true;
        break;
      case '--uastc-rdo-lambda':
        parsed.texture.rdoLambda = Number(next());
        break;
      case '--uastc-zstd':
        parsed.texture.zstd = Number(next());
        break;
      case '--jobs':
        parsed.jobs = Number(next());
        break;
      case '--keep-temp':
        parsed.keepTemp = true;
        break;
      case '--skip-content':
        parsed.updateContent = false;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  validateOptions(parsed);
  return parsed;
}

function validateOptions(parsed) {
  const textureMode = parsed.texture?.mode;
  if (textureMode && !['etc1s', 'uastc', 'source'].includes(textureMode)) {
    throw new Error(`Unsupported --texture-mode "${textureMode}". Use "etc1s", "uastc", or "source".`);
  }

  for (const [label, value] of [
    ['--quality', parsed.texture?.quality],
    ['--compression', parsed.texture?.compression],
    ['--rdo-threshold', parsed.texture?.rdoThreshold],
    ['--uastc-level', parsed.texture?.level],
    ['--uastc-rdo-lambda', parsed.texture?.rdoLambda],
    ['--uastc-zstd', parsed.texture?.zstd],
    ['--jobs', parsed.jobs],
  ]) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new Error(`${label} must be a non-negative number.`);
    }
  }
}

function printHelp() {
  console.log(`
Usage: npm run compress:models -- [options]

Options:
  --src <dir>              Source GLB directory. Default: models-src
  --out <dir>              Output GLB directory. Default: public/models
  --models <names>         Comma-separated filenames or ids to process.
  --texture-mode <mode>    etc1s, uastc, or source. Default: uastc
  --quality <1-255>        ETC1S quality. Default: 220
  --compression <0-5>      ETC1S compression effort. Default: 4
  --rdo-threshold <value>  ETC1S RDO threshold. Default: 1.0
  --no-rdo                 Disable ETC1S or UASTC RDO.
  --uastc-level <0-4>      UASTC quality level. Default: 2
  --uastc-rdo              Enable UASTC RDO.
  --uastc-rdo-lambda <n>   UASTC RDO lambda.
  --uastc-zstd <0-22>      UASTC Zstandard level. Default: 18
  --jobs <n>               KTX encoder jobs. Default: min(cpu count, 4)
  --keep-temp              Keep intermediate Draco-only files.
  --skip-content           Do not update content/creatures/*.json.
`.trim());
}

function mergeModelOptions(base, override = {}) {
  return {
    ...base,
    ...override,
    texture: { ...base.texture, ...override.texture },
    draco: { ...base.draco, ...override.draco },
  };
}

async function runTextureCompression({ gltfTransformBin, ktxBin, input, output, texture, jobs }) {
  const mode = texture.mode ?? DEFAULTS.texture.mode;
  const cliArgs = [mode, input, output, '--jobs', String(jobs)];

  if (mode === 'etc1s') {
    cliArgs.push('--quality', String(texture.quality ?? DEFAULTS.texture.quality));
    cliArgs.push('--compression', String(texture.compression ?? DEFAULTS.texture.compression));
    cliArgs.push('--rdo-threshold', String(texture.rdoThreshold ?? DEFAULTS.texture.rdoThreshold));
    if ((texture.rdo ?? true) === false) cliArgs.push('--rdo', 'false');
  } else if (mode === 'uastc') {
    if (texture.level !== undefined) cliArgs.push('--level', String(texture.level));
    if (texture.rdo ?? false) cliArgs.push('--rdo', 'true');
    if (texture.rdoLambda !== undefined) cliArgs.push('--rdo-lambda', String(texture.rdoLambda));
    if (texture.zstd !== undefined) cliArgs.push('--zstd', String(texture.zstd));
  } else {
    throw new Error(`Unsupported texture mode "${mode}".`);
  }

  const env = {
    ...process.env,
    PATH: `${path.dirname(ktxBin)}${path.delimiter}${process.env.PATH ?? ''}`,
  };

  try {
    await execFileAsync(gltfTransformBin, cliArgs, {
      cwd: repoRoot,
      env,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const detail = [error.stdout, error.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`KTX2 compression failed for ${path.basename(output)}.\n${detail}`, { cause: error });
  }
}

async function resolveKtxBinary() {
  const candidates = [
    process.env.KTX_BIN,
    await findOnPath('ktx'),
    path.join(repoRoot, 'node_modules/.cache/ktx-software/bin/ktx'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await assertExecutable(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    [
      'Missing KTX-Software 4.3+ `ktx` encoder.',
      'Install it from https://github.com/KhronosGroup/KTX-Software/releases,',
      'put `ktx` on PATH, or set KTX_BIN=/absolute/path/to/ktx.',
    ].join(' '),
  );
}

async function findOnPath(command) {
  const pathValue = process.env.PATH ?? '';
  for (const dir of pathValue.split(path.delimiter)) {
    if (!dir) continue;
    const candidate = path.join(dir, command);
    try {
      await assertExecutable(candidate);
      return candidate;
    } catch {
      // Keep looking.
    }
  }
  return null;
}

async function assertExecutable(filePath, message = `Not executable: ${filePath}`) {
  try {
    await access(filePath, fsConstants.X_OK);
  } catch {
    throw new Error(message);
  }
}

async function fsTempDir() {
  const tempRoot = path.join(os.tmpdir(), 'oceaneye-models-');
  return await import('node:fs/promises').then((fs) => fs.mkdtemp(tempRoot));
}

function getModelStats(doc) {
  const report = inspect(doc);
  return {
    triangleCount: report.meshes.properties.reduce((total, mesh) => total + mesh.glPrimitives, 0),
    textureCount: doc.getRoot().listTextures().length,
  };
}

async function updateCreatureMetadata(contentDir, updatesByUrl) {
  const files = (await readdir(contentDir))
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const jsonPath = path.join(contentDir, file);
    const original = await readFile(jsonPath, 'utf8');
    const data = JSON.parse(original);
    const update = updatesByUrl.get(data.model?.url);
    if (!update || !data.model?.quality) continue;

    const quality = data.model.quality;
    const previous = {
      triangleCount: quality.triangleCount,
      textureCount: quality.textureCount,
      fileBytes: quality.fileBytes,
    };

    quality.fileBytes = update.fileBytes;

    if (quality.triangleCount !== update.triangleCount) {
      console.warn(
        `${file}: triangleCount changed ${quality.triangleCount} -> ${update.triangleCount}; updating metadata.`,
      );
      quality.triangleCount = update.triangleCount;
    }

    if (quality.textureCount !== update.textureCount) {
      console.warn(
        `${file}: textureCount changed ${quality.textureCount} -> ${update.textureCount}; updating metadata.`,
      );
      quality.textureCount = update.textureCount;
    }

    const next = `${JSON.stringify(data, null, 2)}\n`;
    if (next !== original) {
      await writeFile(jsonPath, next, 'utf8');
      console.log(
        `Updated ${path.relative(repoRoot, jsonPath)} fileBytes ${previous.fileBytes} -> ${quality.fileBytes}.`,
      );
    }
  }
}

function describeTextureSettings(texture) {
  if (texture.mode === 'source') {
    return 'source texture';
  }

  if (texture.mode === 'uastc') {
    const parts = [`UASTC level ${texture.level ?? 2}`];
    if (texture.rdo) parts.push(`RDO lambda ${texture.rdoLambda ?? 1}`);
    parts.push(`Zstd ${texture.zstd ?? 18}`);
    return parts.join(', ');
  }

  return [
    `ETC1S q${texture.quality ?? DEFAULTS.texture.quality}`,
    `c${texture.compression ?? DEFAULTS.texture.compression}`,
    texture.rdo === false ? 'no RDO' : `RDO ${texture.rdoThreshold ?? DEFAULTS.texture.rdoThreshold}`,
  ].join(', ');
}

function printReport(rows) {
  const totalBefore = rows.reduce((total, row) => total + row.beforeBytes, 0);
  const totalAfter = rows.reduce((total, row) => total + row.afterBytes, 0);
  const cloudflareWarnings = rows.filter((row) => row.afterBytes >= CLOUDFLARE_PAGES_FILE_LIMIT_BYTES);

  console.log('');
  console.log(formatTable([
    ['Model', 'Texture', 'Before', 'After', 'Saved'],
    ...rows.map((row) => [
      row.filename,
      row.textureLabel,
      formatMiB(row.beforeBytes),
      formatMiB(row.afterBytes),
      `${formatMiB(row.savedBytes)} (${formatPercent(row.savedBytes / row.beforeBytes)})`,
    ]),
    ['TOTAL', '', formatMiB(totalBefore), formatMiB(totalAfter), `${formatMiB(totalBefore - totalAfter)} (${formatPercent((totalBefore - totalAfter) / totalBefore)})`],
  ]));

  console.log('');
  console.log(`Output total: ${formatMiB(totalAfter)} (${totalAfter.toLocaleString()} bytes)`);

  if (cloudflareWarnings.length) {
    console.warn('Cloudflare Pages 25 MiB per-file limit warnings:');
    for (const row of cloudflareWarnings) {
      console.warn(`- ${row.filename}: ${formatMiB(row.afterBytes)}`);
    }
  } else {
    console.log('Cloudflare Pages 25 MiB per-file check: all outputs are below the limit.');
  }

  const changedTopology = rows.filter(
    (row) =>
      row.beforeStats.triangleCount !== row.afterStats.triangleCount ||
      row.beforeStats.textureCount !== row.afterStats.textureCount,
  );
  if (changedTopology.length) {
    console.warn('Count changes detected:');
    for (const row of changedTopology) {
      console.warn(
        `- ${row.filename}: triangles ${row.beforeStats.triangleCount} -> ${row.afterStats.triangleCount}, textures ${row.beforeStats.textureCount} -> ${row.afterStats.textureCount}`,
      );
    }
  } else {
    console.log('Triangle and texture counts: unchanged for all processed models.');
  }
}

function formatTable(rows) {
  const widths = rows[0].map((_, columnIndex) =>
    Math.max(...rows.map((row) => String(row[columnIndex]).length)),
  );

  return rows
    .map((row, rowIndex) => {
      const line = row
        .map((cell, columnIndex) => String(cell).padEnd(widths[columnIndex]))
        .join('  ');
      if (rowIndex === 0) {
        const divider = widths.map((width) => '-'.repeat(width)).join('  ');
        return `${line}\n${divider}`;
      }
      return line;
    })
    .join('\n');
}

function formatMiB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}
