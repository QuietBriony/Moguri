# Moguri

Moguri is a working notebook and static member site for shaping an idea from:

- Nishihara Town Gymnasium public facility information
- A recorded conversation/audio memo
- Follow-up planning notes for the member group

The public site is designed for GitHub Pages. Raw audio is kept local and ignored by Git.

Live site: <https://quietbriony.github.io/Moguri/>

GitHub repo: <https://github.com/QuietBriony/Moguri>

## Local Workflow

```powershell
python scripts/analyze_audio.py source/audio/2.m4a
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish Workflow

Publishing was completed to a public GitHub Pages site on 2026-06-06. Future pushes to `main` run `.github/workflows/pages.yml`.
