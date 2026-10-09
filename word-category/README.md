# 📂 Kategori Kata KBBI

This folder contains comprehensive categorization data extracted from the KBBI (Kamus Besar Bahasa Indonesia) database. All categories are organized into specialized JSON files for easy consumption.

## 📊 Statistics

- **Total Files Processed**: 112,596 dictionary entries (A-Z complete)
- **Unique Categories Found**: 443 different category codes
- **Files with Enhanced Types**: 84,929 entries with Indonesian type classifications
- **Popular Combinations**: 744 common category combinations
- **Extraction Date**: August 6, 2025

## 📁 Files Overview

### 🔍 `indeks.json`
Master index file containing overview and metadata about all category files.

### 📋 `kategori.json` (Complete Database)
- **Size**: 2,436 lines
- **Contains**: All 443 unique categories + 744 popular combinations  
- **Use Case**: Comprehensive category reference
- **Format**: Streamlined (optimized without detailed descriptions)

### 📝 `kelas-kata.json` (Grammatical Categories)
Word classes and parts of speech:
- `n` - Nomina (Noun)
- `v` - Verba (Verb) 
- `a` - Adjektiva (Adjective)
- `adv` - Adverbia (Adverb)
- `int` - Interjeksi (Interjection)
- And more...

### 🌍 `bahasa.json` (Language Origins)
Language and regional classifications:
- **Foreign Languages**: Arab, Inggris, Italia, Portugis
- **Regional Languages**: Jawa, Sunda, Betawi, Bali
- **Classical Languages**: Latin, Sanskerta

### 🎓 `bidang-subjek.json` (Academic Fields)
Subject domains and specialized fields:
- **Sciences**: Kimia, Fisika, Biologi, Matematika
- **Medical**: Kedokteran, Farmasi
- **Technology**: Komputer, Teknologi Informasi
- **Humanities**: Sastra, Sejarah, Linguistik
- And many more...

### 🔗 `lainnya.json` (Miscellaneous Categories)
Additional categories not covered by main files:
- **Regional Languages**: Dayak, Gorontalo, Nias, Sasak
- **Specialized Fields**: Meteorologi, Botani, Astronomi
- **Technical Terms**: Komputer, Kesenian, Olahraga
- **205 unique categories** with usage statistics

## 🚀 Usage Examples

### CDN Access
```javascript
// Get all categories
const categories = await fetch('https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-category/kategori.json')
  .then(r => r.json());

// Get only word classes
const wordClasses = await fetch('https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-category/kelas-kata.json')
  .then(r => r.json());

// Get language classifications  
const languages = await fetch('https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-category/bahasa.json')
  .then(r => r.json());

// Get subject domains
const subjects = await fetch('https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-category/bidang-subjek.json')
  .then(r => r.json());

// Get miscellaneous categories
const misc = await fetch('https://cdn.jsdelivr.net/gh/mlengse/kbbi-harvester-cdn@main/word-category/lainnya.json')
  .then(r => r.json());
```

### Filter by Category
```javascript
// Find all nouns (Nomina) 
const nouns = wordClasses.word_classes.filter(cat => cat.kode === 'n');

// Find all Javanese words
const javanese = languages.languages.filter(cat => cat.kode === 'Jw');

// Find chemistry terms
const chemistry = subjects.subject_domains.filter(cat => cat.kode === 'Kim');

// Find miscellaneous categories like Meteorologi
const meteorology = misc.categories.filter(cat => cat.kode === 'Met');
```

### Enhanced Type System
```javascript
// Each word entry now has Indonesian type classifications
// Example word entry kelasKata structure:
{
  "kelasKata": [
    {"kode": "n", "nama": "Nomina", "tipe": "kelas_kata"},
    {"kode": "Jw", "nama": "Jawa", "tipe": "bahasa"},
    {"kode": "Kim", "nama": "Kimia", "tipe": "bidang_subjek"}
  ]
}

// Available tipe values:
// - "kelas_kata" → Word classes (n, v, a, etc.)
// - "bahasa" → Languages (Jw, Arab, etc.) 
// - "bidang_subjek" → Subject domains (Kim, Bio, etc.)
// - "lainnya" → Miscellaneous (Met, Bot, etc.)
```

### Most Common Combinations
```javascript
// Top 5 most frequent category combinations:
// 1. Jawa + Nomina (1,797 times)
// 2. Nomina + singkatan (1,415 times) 
// 3. akronim + Nomina (1,368 times)
// 4. Kimia + Nomina (1,359 times)
// 5. kiasan + Verba (1,200 times)
```

## 🎯 Use Cases

- **Language Learning Apps**: Filter words by difficulty/origin
- **Educational Tools**: Create subject-specific word lists
- **Research**: Analyze Indonesian language patterns
- **Translation Tools**: Understand word origins and contexts
- **Specialized Dictionaries**: Build domain-specific vocabularies

## 📈 Category Distribution

| Category Type | Count | Examples | File |
|---------------|-------|----------|------|
| Word Classes | 25 | Nomina, Verba, Adjektiva | `kelas-kata.json` |
| Languages | 17 | Arab, Jawa, Inggris, Betawi | `bahasa.json` |
| Subject Domains | 30 | Kimia, Kedokteran, Biologi | `bidang-subjek.json` |
| Miscellaneous | 205 | Meteorologi, Botani, Regional languages | `lainnya.json` |
| **Total Unique** | **277** | **Complete coverage** | **4 specialized files** |

## 🔧 Integration

These files are designed to work seamlessly with the main KBBI word database. Each word entry's `kelasKata` array corresponds to categories found in these files, now enhanced with Indonesian `tipe` classifications for better categorization and filtering.

### Type Enhancement
All 84,929 dictionary entries (A-Z) now include `tipe` fields in their `kelasKata` arrays:
- **kelas_kata**: 62.6% of usage (grammatical categories)  
- **lainnya**: 15.9% of usage (miscellaneous categories)
- **bidang_subjek**: 15.8% of usage (academic fields)
- **bahasa**: 5.7% of usage (language origins)

## 📝 Data Format

All files follow a consistent JSON structure with minor variations:

### `kategori.json` (Streamlined Format)
```json
{
  "meta": {
    "description": "...",
    "total_items": 123,
    "last_updated": "2025-08-06"
  },
  "individual_categories": [
    {
      "kode": "n",
      "nama": "Nomina"
    }
  ]
}
```

### Other Files (Detailed Format)
```json
{
  "meta": {
    "description": "...",
    "total_items": 123,
    "last_updated": "2025-08-06"
  },
  "word_classes": [  // or "languages", "subject_domains", "categories"
    {
      "kode": "n",
      "nama": "Nomina",
      "description": "Kata benda",
      "full_description": "Detailed explanation..."
    }
  ]
}
```

**Note**: `kategori.json` has been optimized by removing `full_description` fields for better performance, while other specialized files retain detailed descriptions for comprehensive reference.

### Word Entry Integration
Each dictionary entry's `kelasKata` now includes Indonesian type classifications:
```json
{
  "word": "example",
  "entries": [{
    "makna": [{
      "kelasKata": [
        {
          "kode": "n",
          "nama": "Nomina",
          "tipe": "kelas_kata"
        },
        {
          "kode": "Jw", 
          "nama": "Jawa",
          "tipe": "bahasa"
        }
      ]
    }]
  }]
}
```

---

Made with 🔍 by analyzing the complete KBBI Harvester database  
**Enhanced**: August 6, 2025 with Indonesian type classifications (A-Z complete)
