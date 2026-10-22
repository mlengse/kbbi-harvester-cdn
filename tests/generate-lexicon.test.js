const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const fsPromises = fs.promises;
const { collectKelasKata, getFilePath, loadJson, main } = require("../scripts/generate-lexicon.cjs");

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

test("getFilePath - edge cases: invalid first character returns null immediately", (t) => {
  const calls = [];
  t.mock.method(fs, "existsSync", (p) => {
    calls.push(p);
    return true;
  });

  const invalidKeys = ["", "123word", "!special", "   space", "—dash", "éxample"];
  for (const key of invalidKeys) {
    assert.equal(getFilePath(key), null);
  }
  // Should not even call fs.existsSync since first character regex /^[A-Z]$/ fails
  assert.equal(calls.length, 0);
});

test("getFilePath - matches candidate 1: ${key}.json", (t) => {
  t.mock.method(fs, "existsSync", (p) => {
    return p.endsWith(path.join("A", "Abc Def.json"));
  });

  const filePath = getFilePath("Abc Def");
  assert.ok(filePath);
  assert.ok(filePath.endsWith(path.join("word-details", "A", "Abc Def.json")));
});

test("getFilePath - matches candidate 2: ${key.replace(/ /g, '%20')}.json", (t) => {
  t.mock.method(fs, "existsSync", (p) => {
    return p.endsWith(path.join("A", "Abc%20Def.json"));
  });

  const filePath = getFilePath("Abc Def");
  assert.ok(filePath);
  assert.ok(filePath.endsWith(path.join("word-details", "A", "Abc%20Def.json")));
});

test("getFilePath - matches candidate 3: ${keyLower}.json", (t) => {
  t.mock.method(fs, "existsSync", (p) => {
    return p.endsWith(path.join("A", "abc def.json"));
  });

  const filePath = getFilePath("Abc Def");
  assert.ok(filePath);
  assert.ok(filePath.endsWith(path.join("word-details", "A", "abc def.json")));
});

test("getFilePath - matches candidate 4: ${keyLower.replace(/ /g, '%20')}.json", (t) => {
  t.mock.method(fs, "existsSync", (p) => {
    return p.endsWith(path.join("A", "abc%20def.json"));
  });

  const filePath = getFilePath("Abc Def");
  assert.ok(filePath);
  assert.ok(filePath.endsWith(path.join("word-details", "A", "abc%20def.json")));
});

test("getFilePath - candidate evaluation priority order and non-existent files", (t) => {
  const checked = [];
  t.mock.method(fs, "existsSync", (p) => {
    checked.push(p);
    return false;
  });

  const filePath = getFilePath("Test Key");
  assert.equal(filePath, null);
  assert.equal(checked.length, 4);
  assert.ok(checked[0].endsWith(path.join("T", "Test Key.json")));
  assert.ok(checked[1].endsWith(path.join("T", "Test%20Key.json")));
  assert.ok(checked[2].endsWith(path.join("T", "test key.json")));
  assert.ok(checked[3].endsWith(path.join("T", "test%20key.json")));
});

test("getFilePath - resolves real files from word-details directory", () => {
  const filePath = getFilePath("pintar");
  assert.ok(filePath);
  assert.ok(filePath.endsWith(path.join("word-details", "P", "pintar.json")));

  const spacePath = getFilePath("jarak zenit");
  assert.ok(spacePath);
  assert.ok(spacePath.includes(path.join("word-details", "J")));
});

test("loadJson - loads and parses JSON file correctly", async () => {
  const jsonPath = path.join(__dirname, "..", "lexicon", "derived_to_root.json");
  const data = await loadJson(jsonPath);
  assert.equal(typeof data, "object");
  assert.ok(data !== null);
});

test("loadJson - rejects promise when reading non-existent file", async () => {
  await assert.rejects(async () => {
    await loadJson("non_existent_file.json");
  });
});

test("getFilePath - path traversal prevention: returns null for invalid or malicious key inputs", (t) => {
  const calls = [];
  t.mock.method(fs, "existsSync", (p) => {
    calls.push(p);
    return true;
  });

  const maliciousKeys = [
    "A/../../etc/passwd",
    "A/../secret",
    "A\\..\\secret",
    "A/sub/path",
    "A\\sub\\path",
    "A\0B",
    "../A",
    "..\\A",
    null,
    undefined,
    123,
    {}
  ];

  for (const key of maliciousKeys) {
    assert.equal(getFilePath(key), null);
  }

  // Ensure fs.existsSync was never invoked for any malicious keys
  assert.equal(calls.length, 0);
});

test("loadJson - logs error to console.error when reading or parsing invalid JSON", async (t) => {
  const errorLogs = [];
  t.mock.method(console, "error", (...args) => {
    errorLogs.push(args);
  });

  const tempFilePath = path.join(__dirname, "temp_malformed.json");
  fs.writeFileSync(tempFilePath, "{ invalid json", "utf-8");

  try {
    await loadJson(tempFilePath);
  } catch (err) {
    console.error(`Error: Failed to load or parse ${tempFilePath}:`, err.message);
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }

  assert.equal(errorLogs.length, 1);
  assert.ok(errorLogs[0][0].includes("Failed to load or parse"));
});

test("main - handles error when loadJson fails for a word-details file", async (t) => {
  const errorLogs = [];
  const logs = [];
  let writtenData = null;

  t.mock.method(console, "error", (...args) => {
    errorLogs.push(args);
  });
  t.mock.method(console, "log", (...args) => {
    logs.push(args);
  });

  t.mock.method(fsPromises, "writeFile", async (p, data) => {
    writtenData = JSON.parse(data);
  });

  t.mock.method(fs, "existsSync", (p) => {
    if (p.includes("makan.json")) return true;
    return false;
  });

  t.mock.method(fsPromises, "readFile", async (p) => {
    if (p.endsWith("derived_to_root.json")) {
      return JSON.stringify({ makan: "makan" });
    }
    if (p.includes("makan.json")) {
      throw new Error("Invalid JSON file");
    }
    return "{}";
  });

  await main();

  assert.equal(errorLogs.length, 1);
  assert.ok(errorLogs[0][0].includes("Failed to load or parse"));
  assert.equal(errorLogs[0][1], "Invalid JSON file");

  assert.ok(writtenData);
  assert.deepEqual(writtenData.makan, { kataDasar: "makan", kelasKata: [] });

  const filesReadLog = logs.find((log) => log[0].startsWith("word-details files read"));
  assert.ok(filesReadLog);
  assert.ok(filesReadLog[0].endsWith(": 0"));
});
