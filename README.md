# OceanEye

OceanEye is an open, curated, interactive 3D ocean life atlas.

The app presents static release-candidate creature models,
depth-based navigation, concise insight cards, and visible source links. It does
not run user-facing AI generation at runtime. AI-assisted tools may help create
candidate assets offline, but only static GLB files and sourced content enter
the public app.

Status: public release candidate / preview.

## Included

- Vite, React, TypeScript, React Three Fiber, Drei, and Three.js runtime app.
- Nine MVP creature records:
  yellow boxfish, spiny seahorse, giant manta ray, ocean sunfish, orca, giant
  oarfish, dumbo octopus, tripod fish, and hadal snailfish.
- Five depth zone story records.
- Static GLB model files under `public/models/` with clean public paths.
- Public documentation for setup, deployment, provenance, contribution, and
  license boundaries.

## Not Included

This public release candidate intentionally excludes private project memory,
raw research notes, internal prompts, Content Studio, sandbox experiments,
model-production logs and source assets, local launchers, caches, screenshots,
dist outputs, and git history from the private working repo.

## Quick Start

Use Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
npm run build
```

For a production preview after building:

```bash
npm run preview
```

## Repository Layout

```text
content/          Public creature and depth-zone JSON records
docs/             Public workflow, provenance, and deployment notes
public/models/    Static public GLB model files
src/              Runtime app source code
```

## Languages

Public documentation is English-only for v1. The runtime app keeps the existing
language switch, with English as the default and Chinese available in the
product experience.

## Licenses

- Code: MIT. See `LICENSE`.
- Public OceanEye-authored content and public model files: CC BY 4.0. See
  `CONTENT_LICENSE.md`.
- Brand/name/identity: not licensed for impersonation or misleading
  endorsement.

## Provenance

See `docs/PROVENANCE.md` for source and model provenance policy, and
`docs/AI_WORKFLOW.md` for the reusable AI-assisted offline asset workflow.

## Release Candidate Notes

The current GLB files are public clean-path release-candidate assets. Treat this
repo as a transparent preview until science, performance, and source-copy review
are finalized for a full public release.
