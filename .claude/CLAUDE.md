# Finance Dashboard — Skill Context

This document defines conventions used by the `/rocket` import skill and its agents.
It is the authoritative reference for data format, field rules, and pipeline behavior.

---

## Pipeline Summary

```
statements/          →  pdf_to_markdown.py   →  statements/<file>.md
statements/<file>    →  statement-normalizer  →  statements/<file>_normalized.csv
_normalized.csv      →  merchant-normalizer   →  (updated in place)
_normalized.csv      →  categorizer           →  (updated in place)
_normalized.csv(s)   →  csv_utils.py          →  data/transactions.csv
```

Bank PDFs are converted to structured markdown first, then each agent enriches the
normalized CSV in sequence. Python scripts handle all deterministic file I/O.
Agents handle all judgment: bank detection, parsing, merchant resolution, categorization.

---

## transactions.csv — Column Schema

Column order is fixed. Never reorder. Never add extra columns.

| # | Column | Type | Required | Notes |
|---|--------|------|----------|-------|
| 1 | `id` | string | yes | SHA-256 of raw `date + amount + description`, hex-encoded |
| 2 | `date` | string | yes | `YYYY-MM-DD` |
| 3 | `description` | string | yes | Raw, unmodified text from statement |
| 4 | `normalized_description` | string | yes | Cleaned, title-cased |
| 5 | `amount` | decimal | yes | Negative = expense/charge, positive = income/credit |
| 6 | `merchant` | string | yes | Canonical merchant name |
| 7 | `category` | string | yes | From taxonomy in `RULES.md` |
| 8 | `subcategory` | string | no | From taxonomy in `RULES.md`; empty string if unknown |
| 9 | `account` | string | no | Human-readable account name (e.g. "Chase Sapphire", "PNC Checking") |
| 10 | `account_type` | string | yes | `credit` or `debit` |
| 11 | `source_file` | string | yes | Original statement filename |
| 12 | `needs_review` | boolean | yes | `true` or `false` (lowercase) |
| 13 | `notes` | string | no | Empty string unless explicitly set |
| 14 | `created_at` | string | yes | ISO 8601 UTC: `YYYY-MM-DDTHH:MM:SSZ` |
| 15 | `updated_at` | string | yes | ISO 8601 UTC: `YYYY-MM-DDTHH:MM:SSZ` |

---

## Field Conventions

### `id`
SHA-256 of the concatenation of raw (pre-cleaning) `date + amount + description` as strings.
Hex-encoded. Used for deduplication — same physical transaction always produces the same id.

### `amount`
- **Expenses / charges**: negative (e.g. `-42.50`)
- **Income / credits / payments**: positive (e.g. `2500.00`)
- Credit card statements typically list charges as positive — negate them
- Debit account withdrawals are negative; deposits are positive

### `account_type`
- `credit` — credit card accounts
- `debit` — checking, savings, or any bank account

### `needs_review`
- `false` — high-confidence merchant and category (no human review needed)
- `true` — low-confidence merchant name OR ambiguous category
- Once set to `true` by any agent, preserve it — do not downgrade to `false` downstream

### Boolean fields
Always lowercase: `true` / `false`. Never `True`, `False`, `1`, `0`.

### Empty optional fields
Use empty string `""`. Never use `null`, `N/A`, or placeholder text.

### Timestamps
ISO 8601 UTC format: `2025-03-15T14:22:00Z`. Always UTC.
- `created_at`: set once on first import, never changed on subsequent overwrites
- `updated_at`: updated every time the row is written or modified

---

## Deduplication Rules

- Match on `id` (SHA-256 hash)
- If `id` already exists in `data/transactions.csv`:
  - Overwrite all fields **except** `created_at`
  - Update `updated_at` to current timestamp
- If `id` is new: append row, set both `created_at` and `updated_at`

---

## Key File Locations

| File | Purpose |
|------|---------|
| `.claude/skills/rocket/RULES.md` | Category taxonomy — valid categories and subcategories |
| `.claude/skills/rocket/bank-formats/` | Per-bank statement format docs (one file per institution) |
| `.claude/skills/rocket/scripts/pdf_to_markdown.py` | PDF → structured markdown |
| `.claude/skills/rocket/scripts/csv_utils.py` | CSV concat, dedup, sort, write |
| `data/merchants.json` | Persistent merchant normalization dictionary |
| `data/transactions.csv` | Canonical output — all imported transactions |
| `statements/` | Drop zone for raw statement files (PDF or CSV) |
