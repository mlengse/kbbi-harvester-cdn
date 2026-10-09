# Changelog

## v1.0.0 (2026-09-12)

First stable release.

### Added
- `dataset.json` with entry counts, schema version, and CDN base URL
- `schema.json` with JSON Schema for word-details files
- `index.json` - flat word index for offline lookup
- `CONTRIBUTING.md` with contribution guidelines
- Issue templates for data errors and documentation
- CI workflow: JSON validation, junk-file check, smoke test
- This changelog

### Changed
- License changed from ISC to MIT
- Simplified license line in README
- **Breaking:** Removed `authenticated` field from all word-details files
- **Breaking:** Added `terkait` object to all `makna` entries with keys: `kataTurunan`, `gabunganKata`, `peribahasa`, `idiom`, `peribahasa_dan_makna`

### Fixed
- CDN URLs corrected to point at `kbbi-harvester-cdn` (was `kbbi-harvester`)
- Removed `.DS_Store` files and `.vscode/` directory
- Replaced `.gitignore` with data-repo appropriate rules

### Documentation
- README rewritten with legal disclaimer, usage examples, folder structure, path rules, and JSON schema overview
- Added Data Variability section explaining dynamic field presence with stats and examples
