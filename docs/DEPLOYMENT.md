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
It also reads `public/_headers`, which gives `/models/*`, `/draco/*`, and
`/basis/*` long-lived immutable cache headers.

Model filenames are not content-hashed. Because `/models/*` is served with
`Cache-Control: public, max-age=31536000, immutable`, replacing a model at the
same path can leave returning visitors with a stale cached copy. When a model is
updated, bust the cache by renaming the file or appending a version query, then
update the matching `url` in `content/creatures/*.json`.

## Cloudflare Pages Runbook

### A. Create the project

In the Cloudflare dashboard:

1. Go to Workers & Pages > Create > Pages > Connect to Git.
2. Select `woody-design/oceaneye`.
3. Set the production branch to `main`.
4. Use build command `npm run build`.
5. Use build output directory `dist`.
6. Leave the root directory at the default repo root.
7. Deploy.

The Node version is pinned by `.node-version` at the repo root. The first build
lands on `https://<project>.pages.dev`.

### B. Verify the `.pages.dev` URL

Before attaching the custom domain, verify `https://<project>.pages.dev`:

1. `/` redirects to `/en/`.
2. `/en/` and `/zh/` load.
3. A deep path such as `/en/anything` returns the app through the SPA fallback,
   not a 404.
4. Every creature model loads from `/models/*.glb`.
5. `/og.jpg`, `/favicon.svg`, and `/site.webmanifest` return 200.
6. A model response includes the immutable cache header:

```bash
curl -I https://<project>.pages.dev/models/<one>.glb
```

Expected header:

```http
cache-control: public, max-age=31536000, immutable
```

### C. Attach the custom domain

In the Pages project:

1. Go to Custom domains > Set up a domain.
2. Enter `oceaneye.woodydesign.io`.
3. Continue.

Because `woodydesign.io` is already a Cloudflare zone, Cloudflare creates the
CNAME automatically.

Do not manually create the CNAME first. Adding the DNS record before registering
the domain in the Pages dashboard causes a 522 error.

Before starting, confirm that no existing DNS record uses the `oceaneye`
subdomain and that the apex `woodydesign.io` site is unaffected. Wait for the
certificate and DNS to become active, then re-run the section-B checks on
`https://oceaneye.woodydesign.io`.

### D. Post-deploy validation

These checks are only possible once the production domain is live:

1. Social card: paste the live URL into `opengraph.xyz` and `metatags.io`.
2. Force a re-scrape with Facebook Sharing Debugger and LinkedIn Post Inspector.
   Their caches are sticky, so the card will not update otherwise.
3. Favicon: run realfavicongenerator.net's checker on the live URL.
4. Confirm the browser tab icon and an iOS/Android add-to-home-screen icon.
5. Run the real-device performance QA pass on a few mid/low-end devices.

### E. Pitfalls

- Node is pinned through `.node-version`; do not add a `wrangler.toml` or
  `wrangler.jsonc` for Pages.
- Add the custom domain in the Pages dashboard before any CNAME exists, or the
  domain can return 522.
- `og:image` is an absolute URL and only resolves once the production domain is
  live; validate it and force platform re-scrapes after deploy.
- Pushing to `main` triggers a production redeploy. Other branches get preview
  URLs.

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
