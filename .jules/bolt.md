## 2026-03-31 - Targeted Lookups vs Directory Iteration in Large Datasets
**Learning:** When generating mapping files (e.g. `lexicon/derived_to_root_with_kelas.json`) based on a known list of keys (`derived_to_root.json` with 33K entries) from a huge dataset (`word-details/` containing 112K+ JSON files), iterating over all 112K+ files in the directory tree incurs massive disk I/O overhead. Doing targeted candidate file path lookups for only the keys of interest reduces files checked from ~112.5K to ~27K, executing ~8x faster (~6.4s down to ~0.8s).
**Action:** Always check if processing can be key-driven with targeted file lookups instead of full dataset scans when operating on large static file structures.

## 2026-04-18 - Chunked ProcessPoolExecutor for Mass File Parsing
**Learning:** Validating or processing 112K+ small files sequentially in Python causes high CPU/I/O wait times (~8.8s). Using `ThreadPoolExecutor` fails due to CPython GIL contention (~34s+). Using `ProcessPoolExecutor` with path chunking avoids inter-process communication (IPC) overhead for every file, dropping execution time from ~8.8s to ~1.8s (~78% faster / ~4.8x speedup).
**Action:** When performing batch CPU-bound operations (like JSON parsing) over tens of thousands of items in Python, use `ProcessPoolExecutor` with multi-item chunking rather than item-by-item worker tasks or threads.

## 2026-04-19 - Testing Pure Utility Functions via CommonJS Export Conditional
**Learning:** Pure utility functions embedded in Node.js CLI scripts can be tested cleanly without running CLI side effects by checking `require.main === module` before executing main and exporting the utility functions.
**Action:** Use `if (require.main === module)` to wrap CLI invocations in CommonJS scripts to enable clean unit testing of exported helper functions.
