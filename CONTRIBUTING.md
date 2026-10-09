# Contributing

Thanks for your interest in improving the KBBI CDN Dataset.

## What This Repo Is

This is a **data repository**, not a code project. It holds JSON files harvested from publicly accessible KBBI sources, served via CDN. Changes should be minimal and focused on data accuracy or documentation.

## What to Contribute

- **Data errors** - wrong definitions, typos, missing entries (open an issue)
- **Documentation fixes** - corrections, clearer examples
- **CI/validation improvements** - better checks to prevent bad data

## What NOT to Send

- **Do not send PRs that rename or restructure all 100k+ files.** Mass renames break existing clients.
- **Do not add harvester/bot scripts.** This is a CDN data repo, not a harvester repo.
- **Do not modify CDN URLs** unless correcting a known error.

## Reporting Data Issues

Open an issue with:
- The word (and letter folder, e.g. `P/pintar.json`)
- What's wrong
- Suggested fix if applicable

## Pull Requests

1. Fork and create a branch
2. Make minimal, focused changes
3. Run validation: `python3 .github/scripts/validate_json.py`
4. Open a PR with a clear description

## Code of Conduct

Be respectful. This is an unofficial project maintained by volunteers.
