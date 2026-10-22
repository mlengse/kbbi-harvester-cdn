#!/usr/bin/env node
/**
 * Generate lexicon/derived_to_root_with_kelas.json.
 *
 * Source of truth untuk mapping: lexicon/derived_to_root.json (33.268 keys).
 * Untuk setiap kata turunan, ambil kode kelas kata (tipe "kelas_kata") dari
 * word-details/{A-Z}/*.json — hanya dari entry yang memiliki rootWord.
 *
 * Performance note:
 * Uses asynchronous non-blocking file reading (`fs.promises.readFile`) and chunked
 * `Promise.all` execution to reduce handle congestion and I/O wait times.
 *
 * Usage: node scripts/generate-lexicon.cjs
 */
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORD_DETAILS = path.join(ROOT, "word-details");
const DERIVED_TO_ROOT_FILE = path.join(ROOT, "lexicon", "derived_to_root.json");
const OUTPUT_FILE = path.join(ROOT, "lexicon", "derived_to_root_with_kelas.json");

async function loadJson(file) {
  const content = await fsPromises.readFile(file, "utf-8");
  return JSON.parse(content);
}

/** Kumpulkan kode kelas kata (tipe "kelas_kata") dari entry yang punya rootWord. */
function collectKelasKata(detail) {
  const entries = Array.isArray(detail.entries) ? detail.entries : [];
  const withRoot = entries.filter((e) => e.rootWord);
  const selected = withRoot.length > 0 ? withRoot : entries;
  const codes = new Set();
  for (const entry of selected) {
    for (const makna of entry.makna || []) {
      for (const k of makna.kelasKata || []) {
        if (k.tipe === "kelas_kata") codes.add(k.kode);
      }
    }
  }
  return [...codes];
}

/** Cari path file json yang cocok untuk kata turunan secara spesifik. */
function getFilePath(key) {
  if (typeof key !== "string" || !key) return null;
  if (key.includes("..") || key.includes("/") || key.includes("\\") || key.includes("\0")) {
    return null;
  }

  const firstLetter = key.charAt(0).toUpperCase();
  if (!/^[A-Z]$/.test(firstLetter)) return null;

  const keyLower = key.toLowerCase();
  const candidates = [
    path.join(WORD_DETAILS, firstLetter, `${key}.json`),
    path.join(WORD_DETAILS, firstLetter, `${key.replace(/ /g, "%20")}.json`),
    path.join(WORD_DETAILS, firstLetter, `${keyLower}.json`),
    path.join(WORD_DETAILS, firstLetter, `${keyLower.replace(/ /g, "%20")}.json`)
  ];

  const allowedPrefix = WORD_DETAILS + path.sep;

  for (const p of candidates) {
    const resolved = path.resolve(p);
    if (!resolved.startsWith(allowedPrefix)) continue;
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

async function main() {
  const derivedToRoot = await loadJson(DERIVED_TO_ROOT_FILE);
  const derivedKeys = Object.keys(derivedToRoot);

  const out = {};
  let filesRead = 0;

  const CHUNK_SIZE = 1000;
  for (let i = 0; i < derivedKeys.length; i += CHUNK_SIZE) {
    const chunk = derivedKeys.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (key) => {
        out[key] = { kataDasar: derivedToRoot[key], kelasKata: [] };
        const filePath = getFilePath(key);
        if (filePath) {
          try {
            const detail = await loadJson(filePath);
            filesRead++;
            out[key].kelasKata = collectKelasKata(detail);
          } catch (err) {
            console.error(`Error: Failed to load or parse ${filePath}:`, err.message);
          }
        }
      })
    );
  }

  await fsPromises.writeFile(OUTPUT_FILE, JSON.stringify(out, null, 2) + "\n", "utf-8");

  const empty = derivedKeys.filter((k) => out[k].kelasKata.length === 0).length;
  const withKelas = derivedKeys.length - empty;
  console.log(`word-details files read : ${filesRead}`);
  console.log(`derived keys            : ${derivedKeys.length}`);
  console.log(`with kelasKata          : ${withKelas}`);
  console.log(`empty kelasKata (no match): ${empty}`);
  console.log(`output                  : ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  collectKelasKata,
  getFilePath,
  loadJson,
  main
};
