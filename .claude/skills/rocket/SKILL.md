# Bank Statement Importer — SKILL.md

## Overview

This skill imports bank and credit card statements (PDF or CSV) into a single unified output CSV. It extracts transactions, categorizes them using rules + AI fallback, deduplicates, and cleans up input files after processing.

---

## Folder Structure

```
.claude/skills/rocket/
├── SKILL.md                  # This file
├── RULES.md                  # Schema and categorization rules
└── scripts/
    ├── pdf_to_text.py        # Converts PDF statements to .txt
    ├── import_statements.py  # Main import pipeline
    └── categorize.py         # Rule-based + AI categorization

<project root>/
├── statements/               # Drop PDF/CSV statements here before running
└── data/
    └── transactions.csv      # Output — all imported transactions
```

---

## Skill Steps

### Step 1 — Input Validation
- Check `statements/` for `.pdf` and `.csv` files
- If none found, halt and print:
  ```
  No statements found in statements/. Please add PDF or CSV files and re-run.
  ```
- List discovered files before proceeding

### Step 2 — PDF Extraction
- For each `.pdf` in `statements/`, run:
  ```bash
  python scripts/pdf_to_text.py statements/<file>.pdf
  ```
- Output: `statements/<file>.txt` (raw extracted text alongside the PDF)
- Strategy: try `pdfplumber` first (handles tables well); fall back to `pypdf` if pdfplumber yields empty text

### Step 3 — Normalization
- Parse each `.txt` and `.csv` file into a list of raw transaction dicts:
  ```
  { date, description, amount, source_file, account, account_type }
  ```
- Apply light cleaning to `normalized_description`:
  - Strip trailing transaction IDs (e.g. `#12345`, `REF*ABC`)
  - Normalize whitespace
  - Title-case the result
- Extract `merchant` from `normalized_description` where possible; fall back to `normalized_description`
- Generate `id`: SHA-256 of `date + amount + description` (raw, pre-cleaning), hex-encoded

### Step 4 — Categorization
- Load rules from `RULES.md` category list
- For each transaction, attempt keyword/pattern matching on `normalized_description` and `merchant`:
  - If matched → assign `category` + `subcategory`, set `needs_review = false`
  - If unmatched → send to `claude` CLI for best-guess categorization, set `needs_review = true`
- AI prompt must constrain output to valid categories/subcategories from `RULES.md`
- See `scripts/categorize.py` for implementation

### Step 5 — Deduplication + Merge
- Load existing `data/transactions.csv` if it exists
- For each new row:
  - If `id` not found in existing → append
  - If `id` already exists → overwrite the existing row, update `updated_at`, preserve original `created_at`
- Sort output by `date` descending before writing

### Step 6 — Write Output
- Write all rows to `data/transactions.csv`
- Column order must match `RULES.md` exactly (see Column Order section)
- No headers written unless file is new (always include headers on first write)
- Boolean fields: lowercase `true` / `false`
- Empty optional fields: empty string (no placeholder text)

### Step 7 — Cleanup
- Delete all files from `statements/` after successful processing
- If any file failed to process, do NOT delete it — leave it in `statements/` and report the error

### Step 8 — Show Dashboard
- Start the webserver by running `npx serve .` in the project directory
- Open dashboard in system browsser by running `open "http://localhost:3000"`
- View the dashboard

---

## Running the Importer

```bash
# Install dependencies (first time only)
pip install pdfplumber pypdf pandas

# Drop statements into the project's statements/ folder
cp ~/Downloads/td_march_2025.pdf statements/
cp ~/Downloads/amex_march_2025.csv statements/

# Run from anywhere — paths are derived from script location
python .claude/skills/rocket/scripts/import_statements.py
```

---

## Error Handling

| Scenario | Behaviour                                                |
|---|----------------------------------------------------------|
| No files in `statements/` | Halt with message, exit code 1                           |
| PDF text extraction fails | Report error, skip file, leave in `statements/`          |
| CSV parse fails | Report error, skip file, leave in `statements/`               |
| AI categorization fails | Assign `Misc / Uncategorized`, set `needs_review = true` |
| Output CSV write fails | Halt, do not delete input files                          |

---

## Reviewing Flagged Transactions

After each run, filter `data/transactions.csv` for `needs_review = true` to find AI-categorized rows. Correct the `category`, `subcategory`, and set `needs_review = false` manually.

---

## Notes

- `account` and `account_type` must be inferred from the statement filename or header — name your input files clearly (e.g. `td_chequing_march.pdf`, `amex_gold_march.csv`)
- SHA-256 id is deterministic — re-importing the same statement will overwrite, not duplicate
- The `source_file` field captures the original filename for traceability
