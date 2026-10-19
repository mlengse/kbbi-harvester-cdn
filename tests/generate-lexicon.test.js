const test = require("node:test");
const assert = require("node:assert/strict");
const { collectKelasKata } = require("../scripts/generate-lexicon.cjs");

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
