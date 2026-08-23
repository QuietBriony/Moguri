# Publish Checklist

Publishing is human-gated for this workspace.

- Current live site: <https://quietbriony.github.io/Moguri/>
- Current host: GitHub Pages
- Cloudflare Pages: not connected as of 2026-08-23
- GitHub repo: <https://github.com/QuietBriony/Moguri>

## Before publishing

- Confirm the event rows marked `公開` contain only public-safe text.
- Confirm no internal memo, transcript, audio, or generated analysis appears in `dist/`.
- Run `npm run check` and `npm run build`.
- Review the desktop and mobile page locally.
- Confirm whether the target is GitHub Pages, Cloudflare Pages, or both.

The build script uses an allow-list and writes only `index.html`, `styles.css`, `app.js`, `favicon.svg`, and `_headers` to `dist/`.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds and uploads `dist/` whenever an approved change reaches `main`.

## Cloudflare Pages

Repository settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

`wrangler.toml` contains the matching local Pages output configuration. Connecting the repository and choosing the production branch are Cloudflare account operations and require explicit approval.
