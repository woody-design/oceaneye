# Contributing

Thanks for helping OceanEye become more accurate, useful, and trustworthy. This
is a solo MVP, so the most useful contributions are focused and source-aware.

## What Helps Most

- Science corrections with clear references.
- Model provenance or license clarifications.
- Accessibility, performance, and browser compatibility fixes.
- Small runtime improvements that preserve the curated static-site model.
- New creature or model proposals, after opening an issue first.

## Please Avoid

- Copying long text from copyrighted sources into the repo.
- Adding runtime AI generation.
- Adding raw research workspaces, private prompts, provider downloads, or local production logs.
- Submitting model files without a clear provenance and license note.

## Pull Requests

1. Keep changes focused.
2. Run `npm run test` and `npm run build` before opening a PR.
   For interaction, accessibility, or routing changes, also run
   `npx playwright install chromium` once and then `npm run test:e2e`.
3. Document source or model provenance changes.
4. Preserve the separation between `displayDepthMeters` and `actualDepthRangeMeters`.

## Conduct

Be kind, precise, and source-aware. Scientific and licensing corrections are welcome; personal attacks are not.
