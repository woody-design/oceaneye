# Deployment

OceanEye is a static Vite app.

## Local Verification

Use Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
npm run build
npm run preview
```

The production build is written to `dist/`.

## Static Hosting

Any static host that can run an npm build and serve the generated `dist/`
directory should work.

Suggested Cloudflare Pages settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `22.12.0` or newer
- Production custom domain: `oceaneye.woodydesign.io`

The app uses URL-based locales:

- `/en/` serves English.
- `/zh/` serves Chinese.
- `/` redirects to `/en/`.

Cloudflare Pages reads `public/_redirects` during the Vite build and copies it
to `dist/_redirects`.

Suggested GitHub Pages flow:

1. Build with `npm run build`.
2. Publish `dist/` with the hosting workflow of choice.
3. Verify that GLB files under `/models/*.glb` are served with the deployment.

## Pre-Public Checklist

- `npm install` succeeds from a fresh clone.
- `npm run dev` serves the app locally.
- `npm run build` succeeds.
- The app loads each public model path under `/models/*.glb`.
- `/`, `/en/`, and `/zh/` resolve correctly.
- No private memory, raw research, Content Studio, sandbox, local absolute path,
  model-production trace, or draft model path is present.
- Public-facing source wording/copy has been checked for the intended release
  level.
- `robots.txt` points to the public sitemap for the production domain.
