# KBBI Data Repository

Data KBBI (Kamus Besar Bahasa Indonesia) — 112K+ entri kamus untuk training NLP stemmer dan pemenggalan kata.

> Untuk MCP server yang menggunakan data ini, lihat [kbbi-mcp-server](https://github.com/mlengse/kbbi-mcp-server).

---

## Akses Data

### CDN (langsung)

```
https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@data-v4/word-details/P/pintar.json
```

### Clone

```bash
git clone --depth 1 https://github.com/mlengse/kbbi-harvester-cdn.git
```

### Local Development dengan MCP Server

Jika menjalankan `kbbi-mcp-server` secara lokal, clone repo ini sebagai sibling directory:
```bash
# Asumsi struktur:
# bahasa/
#   data/kbbi-harvester-cdn/    ← repo ini
#   framework/kbbi-mcp-server/  ← MCP server

git clone https://github.com/mlengse/kbbi-harvester-cdn.git data/kbbi-harvester-cdn
git clone https://github.com/mlengse/kbbi-mcp-server.git framework/kbbi-mcp-server
```
`kbbi-mcp-server` akan otomatis membaca file lokal dari repo ini jika path-nya sesuai, lalu fallback ke CDN.

---

## Struktur Repository

```
word-details/       112K+ file JSON — definisi, pemenggalan, rootWord, kata turunan
wordlist/           Daftar kata per huruf (A–Z)
word-category/      Kategori: kelas kata, bahasa asal, bidang subjek
word-with-peribahasa/   Kata yang memiliki peribahasa
lexicon/            Root words, derived words, derived-to-root mappings (+ kelas kata)
hyphenation/        Data pemenggalan suku kata (format .dic dan JSON) + aturan pemenggalan EYD V
schemas/            JSON Schema untuk validasi struktur data
orthos/             Referensi Liang Thesis & Patgen2 Tutorial
```

---

## Lexicon (flat files untuk training)

| File | Isi |
|------|-----|
| `lexicon/root_words.txt` | Semua kata dasar (11.170) |
| `lexicon/derived_words.txt` | Semua kata berimbuhan (33.268) |
| `lexicon/derived_to_root.json` | Mapping kata berimbuhan → kata dasar |
| `lexicon/derived_to_root_with_kelas.json` | Mapping + kode kelas kata (tipe `kelas_kata`) per kata turunan |

Format `derived_to_root_with_kelas.json`:

```json
{
  "membantu": { "kataDasar": "bantu", "kelasKata": ["v"] }
}
```

Dihasilkan ulang dengan `node scripts/generate-lexicon.cjs`.

---

## Struktur Data

### Kata berimbuhan

```json
{
  "word": "membantu",
  "entries": [{
    "nama": "mem.ban.tu",
    "rootWord": "bantu",
    "makna": [{ "definisi": "memberi sokongan..." }]
  }]
}
```

### Kata dasar

```json
{
  "word": "pintar",
  "entries": [{
    "nama": "pin.tar",
    "terkait": {
      "kataTurunan": ["kepintaran", "memintarkan", "terpintar"]
    }
  }]
}
```

### Schema

Lihat [`schemas/word-detail.schema.json`](schemas/word-detail.schema.json) untuk definisi lengkap struktur data.

---

## Kategori

| File | Isi | Jumlah |
|------|-----|--------|
| `kelas-kata.json` | Kelas kata (Nomina, Verba, Adjektiva, dll) | 25 |
| `bahasa.json` | Bahasa asal kata | 16 |
| `bidang-subjek.json` | Bidang ilmu/keahlian | 31 |
| `kategori.json` | Semua kategori unik + kombinasi populer | 421 |

---

## Windows Compatibility

Repo ini berisi **112K+ files**. Jika di Windows:

1. **Enable long paths**:
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```
2. **Configure Git**: `git config --system core.longpaths true`
3. **Exclude folder dari Windows Defender** real-time scanning
4. **Shallow clone**: `git clone --depth 1`

---

## License

- **Source Code**: ISC License — Copyright (c) 2026 [mLengse](mailto:medtosys@gmail.com).
- **Original Dictionary Data**: ISC License — Copyright (c) 2025 Listiananda Apriliawan.

---

Dikembangkan untuk keperluan training NLP/Stemmer.
Data KBBI original di-harvest oleh [mlengse](https://github.com/mlengse).
