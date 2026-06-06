# Publish Checklist

Publishing is human-gated for this workspace.

Before running any command that creates a remote repository, pushes commits, or enables Pages, confirm:

- GitHub owner or organization
- Repository visibility: public or private
- Whether the Dropbox audio link is acceptable on the public/member site
- Whether machine transcript excerpts can ever be published

## Prepared Commands

Check authentication:

```powershell
gh auth status
```

Create the GitHub repository, add `origin`, and push `main`:

```powershell
gh repo create OWNER/Moguri --public --source . --remote origin --push
```

For a private repo, replace `--public` with `--private`.

Enable GitHub Pages with GitHub Actions as the build source:

```powershell
gh api --method POST /repos/OWNER/Moguri/pages -f build_type=workflow
```

Trigger or inspect the Pages deployment:

```powershell
gh workflow run pages.yml --ref main
gh run list --workflow pages.yml --limit 3
gh api /repos/OWNER/Moguri/pages --jq .html_url
```

## Expected Pages Behavior

The workflow in `.github/workflows/pages.yml` uploads the repo root as the static artifact and deploys it to GitHub Pages whenever `main` receives a push.
