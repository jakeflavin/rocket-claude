# /rocket — Bank Statement Importer

Imports bank and credit card statements (PDF or CSV) into `data/transactions.csv`.
Processing is split across three agents. This skill orchestrates them in sequence.
No judgment logic lives here — only coordination and error tracking.

---

## Pipeline Overview

```
statements/          →  pdf_to_markdown.py    →  statements/<file>.md
statements/<file>    →  statement-normalizer   →  statements/<file>_normalized.csv
_normalized.csv      →  merchant-normalizer    →  (updated in place)
_normalized.csv      →  categorizer            →  (updated in place)
_normalized.csv(s)   →  csv_utils.py           →  data/transactions.csv
```

---

## Step 1 — Input Validation

Check `statements/` for `.pdf` and `.csv` files.

If none found → halt immediately and print:
```
No statements found in statements/. Please add PDF or CSV files and re-run.
```

List all discovered files before proceeding. Initialize an empty `failed_files[]` tracker.

---

## Step 2 — PDF Conversion

For each `.pdf` in `statements/`, run:
```bash
python scripts/pdf_to_markdown.py statements/<file>.pdf
```

- On success: produces `statements/<file>.md`
- On failure (non-zero exit): add `<file>.pdf` to `failed_files[]`, skip this file, continue to next

---

## Step 3 — Statement Normalization (Agent 1)

For each input file to process:
- `.md` files produced by Step 2
- `.csv` files found in Step 1 (original CSV statements — not `_normalized.csv` files)

For each file, invoke the statement-normalizer agent:
```
@statement-normalizer Process: statements/<filename>
```

- On success: `statements/<filename>_normalized.csv` is produced
- On failure or unrecognized format: add the source file to `failed_files[]`, skip, continue

---

## Step 4 — Merchant Normalization (Agent 2)

For each `_normalized.csv` successfully produced in Step 3, invoke the merchant-normalizer agent:
```
@merchant-normalizer Process: statements/<filename>_normalized.csv
```

- On success: `merchant` and `normalized_description` columns are populated in place
- On failure: add the source statement to `failed_files[]`, skip this file, continue

---

## Step 5 — Categorization (Agent 3)

For each `_normalized.csv` successfully processed by Step 4, invoke the categorizer agent:
```
@categorizer Process: statements/<filename>_normalized.csv
```

- On success: `category`, `subcategory`, and `needs_review` columns are populated in place
- On failure: add the source statement to `failed_files[]`, skip this file, continue

---

## Step 6 — Merge and Write

Collect all successfully processed `_normalized.csv` files. Run:
```bash
python scripts/csv_utils.py statements/<file1>_normalized.csv [statements/<file2>_normalized.csv ...]
```

This script:
1. Concatenates all normalized CSVs
2. Deduplicates against existing `data/transactions.csv` by `id`
3. Sorts by date descending
4. Writes to `data/transactions.csv`

If this step fails → halt, do not delete any files, print the error.

---

## Step 7 — Cleanup

For each **successfully processed** statement file:
- Delete the original file from `statements/` (`.pdf` or `.csv`)
- Delete the `.md` file (if created from a PDF)
- Delete the `_normalized.csv` intermediate file

For each file in `failed_files[]`:
- Leave the original file in `statements/` (so it can be reprocessed or inspected)
- Delete any intermediate files for that statement (`.md`, `_normalized.csv`) if they exist

---

## Step 8 — Report

Print a summary:
```
Processing complete.

Processed: <N> statements → <X> transactions added, <Y> updated
Failed: <N> file(s) — left in statements/ for review:
  - <filename> — reason: <why it failed>

<Z> transaction(s) flagged for review (needs_review: true)
```

---

## Step 9 — Launch Dashboard

Start the web server and open the dashboard:
```bash
npx serve .
```
```bash
open "http://localhost:3000"
```

---

## Error Handling Reference

| Scenario | Behaviour |
|---|---|
| No files in `statements/` | Halt with message |
| PDF conversion fails | Add to `failed_files[]`, skip, continue |
| Unrecognized bank format | Agent 1 reports failure; add to `failed_files[]`, skip |
| Agent 2 or 3 fails | Add to `failed_files[]`, skip that file |
| `csv_utils.py` write fails | Halt, do not delete any files |

---

## Setup (First Time)

```bash
pip install pdfplumber pypdf
```

No other dependencies needed. All agent logic runs inside Claude Code.

---

## Notes

- Name your statement files clearly — the filename is used to infer `account` and `account_type`
  - Example: `chase_sapphire_march.pdf` → account `"Chase Sapphire"`, type `credit`
  - Example: `pnc_checking_march.pdf` → account `"PNC Checking"`, type `debit`
- SHA-256 `id` is deterministic — re-importing the same statement overwrites rather than duplicates
- `data/merchants.json` accumulates knowledge across runs — each import improves future accuracy
- Add new bank support by creating `docs/bank-formats/<bank>.md` — no code changes needed
