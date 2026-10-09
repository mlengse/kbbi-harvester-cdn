# KBBI Data Repository

Data KBBI (Kamus Besar Bahasa Indonesia) — 112K+ entri kamus untuk training NLP stemmer dan pemenggalan kata.

> **Disclaimer:** This project is not affiliated with, endorsed by, or connected to Badan Pengembangan dan Pembinaan Bahasa (Badan Bahasa) or Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen). The dictionary content belongs to its respective owners. This repository only packages publicly accessible data for developer convenience.

> Untuk MCP server yang menggunakan data ini, lihat [kbbi-mcp-server](https://github.com/mlengse/kbbi-mcp-server).

## Quick Start

### CDN (langsung)

```text
https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-details/P/pintar.json
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

```text
word-details/           112K+ file JSON — definisi, pemenggalan, rootWord, kata turunan
wordlist/               Daftar kata per huruf (A–Z)
word-category/          Kategori: kelas kata, bahasa asal, bidang subjek
word-with-peribahasa/   Kata yang memiliki peribahasa
lexicon/                Root words, derived words, derived-to-root mappings (+ kelas kata)
hyphenation/            Data pemenggalan suku kata (.dic dan JSON) + aturan pemenggalan EYD V
schemas/                JSON Schema untuk validasi struktur data
orthos/                 Referensi Liang Thesis & Patgen2 Tutorial
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

[`schemas/word-detail.schema.json`](schemas/word-detail.schema.json) adalah **schema otoritatif** untuk file `word-details/*.json` (JSON Schema draft 2020-12) — mencakup `authenticated`, `etimologi`, `jenis`, dan `idiom_dan_makna`. File `schema.json` di root bersifat **legacy** (dari upstream) dan tidak dipakai untuk validasi.

### Cara mengambil definisi sebuah kata

1. 🔎 Cari kata di folder `wordlist`.
2. 📂 Buka file JSON terkait di `word-details/{Huruf Awal}/{kata}.json`
   (kata dengan spasi gunakan `%20`, contoh: `a tempo` → `a%20tempo.json`).
3. 🌐 Atau ambil langsung via CDN:
   ```text
   https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-details/{Huruf Awal}/{kata}.json
   ```

---

## Kategori

| File | Isi | Jumlah |
|------|-----|--------|
| `kelas-kata.json` | Kelas kata (Nomina, Verba, Adjektiva, dll) | 25 |
| `bahasa.json` | Bahasa asal kata | 16 |
| `bidang-subjek.json` | Bidang ilmu/keahlian | 31 |
| `kategori.json` | Semua kategori unik + kombinasi populer | 421 |

---

## Path Rules

- Folder names use the **uppercase first letter** of the word (e.g. `P/pintar.json`)
- Filenames match the `word` field verbatim with `.json` appended
- Spaces in multi-word entries are encoded as `%20` in URLs
- Filenames are **Windows-safe**: no curly quotes, no trailing dots or spaces, no reserved characters

### Word-to-Path Conversion

| Word | Path |
|------|------|
| `pintar` | `word-details/P/pintar.json` |
| `a tempo` | `word-details/A/a%20tempo.json` |
| `Amerika Serikat` | `word-details/A/Amerika%20Serikat.json` |

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

Semua nama file dan folder dibuat kompatibel dengan Windows: tanpa karakter ilegal (`< > : " / \ | ? *`), tanpa tanda kutip keriting, serta tanpa titik atau spasi di akhir nama. Repo dapat di-clone dan dikerjakan baik di Windows native maupun di WSL.

---

## Offline Use

- **`index.json`** — flat JSON array berisi seluruh 112.596 key kata (untuk lookup/filter cepat tanpa permintaan CDN).

---

## Related Projects

- [kbbi-mcp-server](https://github.com/mlengse/kbbi-mcp-server) — MCP server yang mengonsumsi dataset ini
- [kbbi-app](https://github.com/Naandalist/kbbi-app) — Web application untuk menjelajah entri KBBI
- [webland-kbbi](https://github.com/Naandalist/webland-kbbi) — Antarmuka web KBBI

---

## License

MIT License

- **Source Code**: Copyright (c) 2026 [mLengse](mailto:medtosys@gmail.com)
- **Original Dictionary Data**: Copyright (c) 2025 Listiananda Apriliawan

Made with ⏰ by [Naandalist](https://github.com/Naandalist), forked by [mlengse](https://github.com/mlengse).
