# PNC Bank Statement Format

## Fingerprints

Unique strings present in every PNC statement. Match any one to identify this bank.

- `"PNC Bank"`
- `"pnc.com"`
- `"PNC Financial Services"`
- `"For the period"` *(combined with PNC account number or logo context)*

## Source Types Supported

- **PDF statement** — converted to markdown via `pdf_to_markdown.py`
- **CSV export** — available from Online Banking activity download

---

## PDF Format

### Statement Period Header

Every PNC PDF contains a line matching:
```
For the period MM/DD/YYYY to MM/DD/YYYY
```
Extract the start and end dates. Use these to infer the year for all `MM/DD` transaction dates — a date is assigned the year that places it within the statement period.

### Transaction Table Location

PNC statements organize transactions by section:
1. **"Deposits and Other Additions"** — credits/income (positive amounts)
2. **"Banking/Debit Card Withdrawals and Purchases"** — debit card charges (negative)
3. **"Online and Electronic Banking Deductions"** — ACH/bill pay (negative)
4. **"Checks Cleared"** — check payments (negative)

Track the current section to assign the correct sign to amounts.

### Column Mapping (PDF)

| PDF Column | Normalized Field | Notes |
|---|---|---|
| `Date` | `date` | Format: `MM/DD` (year inferred from period) |
| Description | `description` | May span multiple lines |
| Amount | `amount` | Apply sign per section (see above) |

### Multi-line Descriptions

PNC descriptions sometimes wrap across two lines. A continuation line:
- Has no date at the start
- Is ≤ 20 characters
- Contains no dollar amount
- Does not start with common headers (`Date`, `Page`, `PNC`, `Account`, `Banking`)

Join continuation lines to the preceding transaction's description.

### Exclusion Rules (PDF)

Exclude rows where:
- Description contains any of: `"Daily Balance"`, `"Total Withdrawals"`, `"Total Deposits"`, `"Total Charges"`, `"Opening Balance"`, `"Closing Balance"`, `"Beginning Balance"`, `"Ending Balance"`, `"Service Charge"`, `"New Balance"`, `"Previous Balance"`, `"Account Balance"`, `"Total Debits"`, `"Total Credits"`, `"Total Additions"`
- Row has no date (summary or header line)
- Amount is `$0.00`

### Known Quirks

- **Short date format**: PNC uses `MM/DD` with no year — always infer year from the statement period header
- **Section sign assignment**: the section heading determines whether amounts are positive or negative — do not rely on a sign character in the amount string itself
- **Daily balance detail rows**: some rows show `MM/DD  AMOUNT  description` where description itself starts with another `MM/DD AMOUNT` pattern — these are balance detail lines, not transactions; skip them
- **Debit card credit**: the "Deposits and Other Additions" section sometimes includes debit card purchase reversals — these are credits (positive), include them

---

## CSV Format

### Column Mapping

| Statement Column | Normalized Field | Notes |
|---|---|---|
| `Date` | `date` | Format: `MM/DD/YYYY` |
| `Description` | `description` | Raw string |
| `Withdrawals` | `amount` | Negate (make negative) |
| `Deposits` | `amount` | Keep positive |
| `Balance` | *(ignore)* | Running balance, not a transaction |

Only one of `Withdrawals` or `Deposits` will be populated per row. Use whichever is non-empty.

### Exclusion Rules (CSV)

Same as PDF exclusion rules — match on description keywords.

---

## account and account_type

- `account_type`: `debit` (PNC is a bank account)
- `account`: infer from filename (e.g. `pnc_checking_march.pdf` → `"PNC Checking"`)
  - If filename is ambiguous, use `"PNC Bank"`
