const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { collectKelasKata, getFilePath, loadJson } = require("../scripts/generate-lexicon.cjs");

test("collectKelasKata - extracts kelas_kata codes from entries with rootWord", () => {
  const detail = {
    entries: [
      {
        rootWord: "makan",
        makna: [
          {
            kelasKata: [
              { tipe: "kelas_kata", kode: "v" },
              { tipe: "ragam", kode: "cak" }
            ]
          }
        ]
      },
      {
        makna: [
          {
            kelasKata: [
              { tipe: "kelas_kata", kode: "n" }
            ]
          }
        ]
      }
    ]
  };

  const result = collectKelasKata(detail);
  assert.deepEqual(result, ["v"]);
});

test("collectKelasKata - falls back to all entries if no entries have rootWord", () => {
  const detail = {
    entries: [
      {
        makna: [
          {
            kelasKata: [
              { tipe: "kelas_kata", kode: "v" },
              { tipe: "bahasa", kode: "Jw" }
            ]
          }
        ]
      },
      {
        makna: [
          {
            kelasKata: [
              { tipe: "kelas_kata", kode: "n" }
            ]
          }
        ]
      }
    ]
  };

  const result = collectKelasKata(detail);
  assert.deepEqual(result, ["v", "n"]);
});

test("collectKelasKata - ignores non-kelas_kata types and deduplicates codes", () => {
  const detail = {
    entries: [
      {
        rootWord: "baca",
        makna: [
          {
            kelasKata: [
              { tipe: "kelas_kata", kode: "v" },
              { tipe: "ragam", kode: "hor" }
            ]
          },
          {
            kelasKata: [
              { tipe: "kelas_kata", kode: "v" },
              { tipe: "kelas_kata", kode: "a" }
            ]
          }
        ]
      }
    ]
  };

  const result = collectKelasKata(detail);
  assert.deepEqual(result, ["v", "a"]);
});

test("collectKelasKata - handles empty or invalid detail objects gracefully", () => {
  assert.deepEqual(collectKelasKata({}), []);
  assert.deepEqual(collectKelasKata({ entries: [] }), []);
  assert.deepEqual(collectKelasKata({ entries: null }), []);
  assert.deepEqual(collectKelasKata({ entries: [{ rootWord: "test" }] }), []);
  assert.deepEqual(
    collectKelasKata({
      entries: [
        {
          rootWord: "test",
          makna: [{ kelasKata: null }]
        }
      ]
    }),
    []
  );
});


test("getFilePath - resolves valid word details file paths", () => {
  const filePath = getFilePath("pintar");
  assert.ok(filePath);
  assert.ok(filePath.endsWith(path.join("word-details", "P", "pintar.json")));
});

test("getFilePath - resolves files with spaces or lowercased keys", () => {
  const filePath = getFilePath("jarak zenit");
  assert.ok(filePath);
  assert.ok(filePath.includes(path.join("word-details", "J")));
});

test("getFilePath - returns null for non-existent files or invalid keys", () => {
  assert.equal(getFilePath("nonexistentword12345"), null);
  assert.equal(getFilePath("123invalid"), null);
  assert.equal(getFilePath(""), null);
});

test("loadJson - loads and parses JSON file correctly", () => {
  const jsonPath = path.join(__dirname, "..", "lexicon", "derived_to_root.json");
  const data = loadJson(jsonPath);
  assert.equal(typeof data, "object");
  assert.ok(data !== null);
});

test("loadJson - throws error when reading non-existent file", () => {
  assert.throws(() => {
    loadJson("non_existent_file.json");
  });
});
