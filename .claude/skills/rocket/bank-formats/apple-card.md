# Apple Card Statement Format

## Fingerprints

Unique strings present in every Apple Card export. Match any one to identify this source.

- `"Apple Card"`
- `"Goldman Sachs"`
- `"Daily Cash"`
- Column header: `"Purchased By"` *(unique to Apple Card CSV)*

## Source Types Supported

- **CSV export** — exported from Wallet app on iPhone (Settings → Apple Card → Export Transactions)

Apple Card does not provide downloadable PDF statements in a machine-readable format.
If a PDF is provided, attempt to parse it like a generic statement — but it is unlikely to parse cleanly.

---

## CSV Format

### Column Mapping

| Statement Column | Normalized Field | Notes |
|---|---|---|
| `Date` | `date` | Format: `YYYY-MM-DD` |
| `Description` | `description` | Raw merchant name from Apple |
| `Merchant` | *(optional supplement)* | Often cleaner than Description — use as hint for merchant normalization |
| `Category` | *(ignore for categorization)* | Apple's own categories — use our taxonomy instead |
| `Type` | *(use for exclusion)* | `Purchase`, `Payment`, `Refund`, `Adjustment` |
| `Amount (USD)` | `amount` | Positive = charge — **must negate** |
| `Purchased By` | *(ignore)* | Card holder name on family accounts |

### Sign Convention

Apple Card CSV exports charges as **positive** and payments as **negative**. **Negate all amounts** so that charges become negative and payments/credits become positive per project convention.

Exception: `Refund` type rows already represent credits — negate these to make them positive (income).

### Exclusion Rules

Exclude rows where:
- `Type` is `"Payment"` — these are your monthly card payments, not purchases
- `Type` is `"Adjustment"` — bank-side adjustments
- `Amount (USD)` is `0`
- Description is blank

### Handling Refunds

Rows where `Type` is `"Refund"`:
- Include as transactions
- Negate the amount (Apple exports refunds as negative, negating makes them positive/income)
- Categorize as `Income / Refund`
- Set `needs_review: false` (type is explicit)

---

## account and account_type

- `account_type`: `credit`
- `account`: `"Apple Card"` (always — no variants)

---

## Known Quirks

- **`Merchant` column**: Apple provides a cleaner merchant name in the `Merchant` column than in `Description`. Pass both to Agent 2 as context — prefer `Merchant` for normalization if it's more descriptive.
- **Family sharing**: On family accounts, `Purchased By` identifies who made the purchase. Ignore this field unless you want to split tracking by family member.
- **Daily Cash**: Apple's cashback program appears as a credit entry with description `"Daily Cash"` — include as positive income (category: `Income / Refund`).
- **Date format**: Apple Card CSVs use ISO `YYYY-MM-DD` — no date parsing needed.
- **Installment purchases**: Apple Pay Later or device installments may appear as multiple small charges from `"Apple"` — these are legitimate transactions, include them.
