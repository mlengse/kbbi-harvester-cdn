#!/usr/bin/env node
/**
 * Generate lexicon/derived_to_root_with_kelas.json.
 *
 * Source of truth untuk mapping: lexicon/derived_to_root.json (33.268 keys).
 * Untuk setiap kata turunan, ambil kode kelas kata (tipe "kelas_kata") dari
 * word-details/{A-Z}/*.json — hanya dari entry yang memiliki rootWord.
 *
 * Usage: node scripts/generate-lexicon.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORD_DETAILS = path.join(ROOT, "word-details");
const DERIVED_TO_ROOT_FILE = path.join(ROOT, "lexicon", "derived_to_root.json");
const OUTPUT_FILE = path.join(ROOT, "lexicon", "derived_to_root_with_kelas.json");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
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

function main() {
  const derivedToRoot = loadJson(DERIVED_TO_ROOT_FILE);
  const derivedKeys = Object.keys(derivedToRoot);
  const lowerToOriginal = new Map(derivedKeys.map((k) => [k.toLowerCase(), k]));

  const out = {};
  for (const key of derivedKeys) {
    out[key] = { kataDasar: derivedToRoot[key], kelasKata: [] };
  }

  const letters = fs
    .readdirSync(WORD_DETAILS)
    .filter((f) => /^[A-Z]$/.test(f) && fs.statSync(path.join(WORD_DETAILS, f)).isDirectory());

  let filesRead = 0;
  for (const letter of letters) {
    const dir = path.join(WORD_DETAILS, letter);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      try {
        const detail = loadJson(path.join(dir, file));
        filesRead++;
        const original = detail.word
          ? lowerToOriginal.get(String(detail.word).toLowerCase())
          : undefined;
        if (original) {
          out[original].kelasKata = collectKelasKata(detail);
        }
      } catch {
        // skip malformed file
      }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2) + "\n", "utf-8");

  const empty = derivedKeys.filter((k) => out[k].kelasKata.length === 0).length;
  const withKelas = derivedKeys.length - empty;
  console.log(`word-details files read : ${filesRead}`);
  console.log(`derived keys            : ${derivedKeys.length}`);
  console.log(`with kelasKata          : ${withKelas}`);
  console.log(`empty kelasKata (no match): ${empty}`);
  console.log(`output                  : ${OUTPUT_FILE}`);
}

main();
