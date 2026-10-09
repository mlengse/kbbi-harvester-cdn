"""Smoke test: verify a few known files have expected structure."""

import json
import os
import sys

REQUIRED_FIELDS = {"word", "entries"}
SMOKE_FILES = [
    "word-details/P/pintar.json",
    "word-details/G/gajah.json",
    "word-details/K/kecil.json",
]
errors = []

for path in SMOKE_FILES:
    if not os.path.exists(path):
        errors.append(f"{path}: file not found")
        continue
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        missing = REQUIRED_FIELDS - set(data.keys())
        if missing:
            errors.append(f"{path}: missing fields {missing}")
        if not isinstance(data.get("entries"), list) or len(data["entries"]) == 0:
            errors.append(f"{path}: 'entries' is empty or not a list")
    except Exception as e:
        errors.append(f"{path}: {e}")

if errors:
    print("Smoke test failed:")
    for err in errors:
        print(f"  {err}")
    sys.exit(1)

print(f"Smoke test passed: {len(SMOKE_FILES)} files OK.")
