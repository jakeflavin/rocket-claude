# American Express Statement Format

## Fingerprints

Unique strings present in every Amex statement. Match any one to identify this bank.

- `"American Express"`
- `"americanexpress.com"`
- `"AMEX"`
- `"Membership Rewards"`
- `"Member Since"`

## Source Types Supported

- **CSV export** — downloaded from americanexpress.com
- **PDF statement** — converted to markdown via `pdf_to_markdown.py`

---

## CSV Format

### Column Mapping

| Statement Column | Normalized Field | Notes |
|---|---|---|
| `Date` | `date` | Format: `MM/DD/YYYY` |
| `Description` | `description` | Raw string |
| `Card Member` | *(ignore)* | |
| `Account #` | *(ignore)* | |
| `Amount` | `amount` | Positive = charge — **must negate** |

### Sign Convention

Amex CSV exports charges as **positive** and payments as **negative**. **Negate all amounts** so that charges become negative and payments/credits become positive per project convention.

### Exclusion Rules

Exclude rows where:
- Description contains `"TOTAL AMOUNT DUE"` or `"NEW BALANCE"`
- Description contains `"PAYMENT"` and amount is negative (already-negated payments)
- `Amount` is `0`

---

## PDF Format

### Transaction Table Location

Appears after the **"Account Summary"** section under a heading like **"Transactions"** or **"New Charges"**. Each card (if multiple on account) has its own section.

### Column Mapping (PDF)

| PDF Column | Normalized Field | Notes |
|---|---|---|
| `Date` | `date` | Format: `MM/DD/YY` |
| Description (first token group) | `description` | See quirks — wide-space columns |
| Amount (rightmost) | `amount` | Positive = charge — **must negate** |

### Statement Period Header

Look for a line matching:
```
Closing Date  MM/DD/YY
```
or
```
Statement Period: MM/DD/YY - MM/DD/YY
```

### Exclusion Rules (PDF)

Exclude rows where:
- Description contains `"Payment Received"` or `"AutoPay"`
- Description contains `"New Balance"` or `"Minimum Payment"`
- Row has no date column value
- Amount is blank or `$0.00`

### Known Quirks

- **Wide-column layout**: Amex PDFs use 3+ spaces to separate merchant name, city, and state in a single text column. Split on `\s{3,}` and take only the first segment as `description`.
  - Example: `"WHOLE FOODS MARKET   CHICAGO          IL"` → description is `"WHOLE FOODS MARKET"`
- Foreign transaction fee rows appear on a separate line referencing the preceding transaction — exclude them (no date)
- Membership Rewards redemptions appear as credits — include these as positive amounts
- If `pdf_to_markdown.py` produces a markdown table, the wide-space splitting is already handled by column separation

---

## account and account_type

- `account_type`: `credit`
- `account`: infer from filename (e.g. `amex_gold_march.pdf` → `"Amex Gold"`)
  - If filename is ambiguous, use `"American Express"`
