# Chase Statement Format

## Fingerprints

Unique strings present in every Chase statement. Match any one to identify this bank.

- `"Chase Bank, N.A."`
- `"CARDMEMBER AGREEMENT"`
- `"JPMorgan Chase"`
- `"chase.com"`

## Source Types Supported

- **CSV export** — downloaded from chase.com (most common)
- **PDF statement** — converted to markdown via `pdf_to_markdown.py`

---

## CSV Format

### Column Mapping

| Statement Column | Normalized Field | Notes |
|---|---|---|
| `Transaction Date` | `date` | Format: `MM/DD/YYYY` |
| `Post Date` | *(ignore)* | Use Transaction Date only |
| `Description` | `description` | Raw string, do not modify |
| `Category` | *(ignore)* | Chase's own categories — use our taxonomy instead |
| `Type` | *(use for exclusion)* | See exclusion rules |
| `Amount` | `amount` | Negative = charge (keep sign as-is) |
| `Memo` | *(ignore)* | |

### Sign Convention

Chase CSV exports charges as **negative** and payments as **positive**. Keep the sign as-is — no negation needed.

### Exclusion Rules

Exclude rows where:
- `Type` is `"Payment"` — these are credit card payments from your bank, not transactions
- `Type` is `"Adjustment"` — bank adjustments
- `Description` contains `"AUTOMATIC PAYMENT"` — autopay entries
- `Amount` is `0`

---

## PDF Format

### Transaction Table Location

Appears under the heading **"Account Activity"** or **"Transaction Detail"**.
Ends before the **"Fees"** or **"Interest Charged"** section.

Each page may contain a partial table. Combine rows across pages before parsing.

### Column Mapping (PDF)

| PDF Column | Normalized Field | Notes |
|---|---|---|
| `Date` | `date` | Format: `MM/DD` — infer year from statement period header |
| `Description` | `description` | May span multiple lines; join continuation lines |
| `Amount` | `amount` | Negative = charge |

### Statement Period Header

Look for a line matching:
```
Opening/Closing Date  MM/DD/YY - MM/DD/YY
```
Use the closing year to resolve `MM/DD` dates that appear near year boundaries.

### Exclusion Rules (PDF)

Exclude rows where:
- Description contains `"Payment Thank You"` or `"AUTOMATIC PAYMENT"`
- Description contains `"Balance Transfer"` — unless you want these tracked
- Description contains `"INTEREST CHARGED"`
- Row has no date (continuation/description line)
- Amount is blank or `$0.00`

### Known Quirks

- Multi-line descriptions: the second line is often a location (city, state) — discard it
- Foreign transactions include an exchange rate note on the following line — discard it
- Rewards/points notifications appear inline — skip rows with no dollar amount
- PDF tables may merge `Date` and `Description` into one column — split on first whitespace token that matches `MM/DD`

---

## account and account_type

- `account_type`: `credit`
- `account`: infer from filename (e.g. `chase_sapphire_march.pdf` → `"Chase Sapphire"`)
  - If filename is ambiguous, use `"Chase Credit Card"`
