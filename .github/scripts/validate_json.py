"""Validate all JSON files in the repository parse correctly."""

import json
import os
import sys

DIRS = ["word-details", "word-category"]
errors = []
count = 0

for directory in DIRS:
    if not os.path.isdir(directory):
        continue
    for root, _, files in os.walk(directory):
        for f in files:
            if not f.endswith(".json"):
                continue
            path = os.path.join(root, f)
            count += 1
            try:
                with open(path, "r", encoding="utf-8") as fh:
                    json.load(fh)
            except Exception as e:
                errors.append((path, str(e)))

print(f"Validated {count} JSON files.")

if errors:
    print(f"\n{len(errors)} file(s) failed:")
    for path, err in errors:
        print(f"  {path}: {err}")
    sys.exit(1)

print("All files valid.")
