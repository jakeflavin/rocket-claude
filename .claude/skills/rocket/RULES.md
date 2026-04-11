# CSV Rules

## Core Principles
- One transaction = one row
- Deterministic `id` based on date + amount + description (SHA-256, hex-encoded)
- On import, if a row with the same `id` already exists, overwrite it and update `updated_at`
- Never output partial rows
- Keep the structure consistent at all times

---

## Required Fields
- id
- date
- description
- normalized_description
- amount
- merchant
- category
- account
- account_type
- source_file
- needs_review
- created_at
- updated_at

## Optional Fields
- subcategory
- notes

---

## Field Rules

### id
- Must be unique
- Deterministically generated via SHA-256 hash of: `date + amount + description` (concatenated as strings)
- Used for deduplication and overwrite matching

### date
- Format: `YYYY-MM-DD`
- Represents the transaction date

### description
- Raw text from statement
- Never modify

### normalized_description
- Clean, human-readable version of description
- Used for display and grouping

### amount
- Must be a number
- Expenses = negative
- Income = positive

### merchant
- Required
- Extracted vendor name if identifiable
- Fallback to `normalized_description` if unclear

### category
- Must come from the predefined list below
- Never invent new categories

### subcategory
- Optional
- Must come from the predefined list for its parent category
- Leave blank if unknown or no match

### account
- Human-readable account name (e.g. "TD Chequing", "Amex Gold")

### account_type
- Must be one of:
  - `credit` — credit card accounts
  - `debit` — checking, savings, or any bank account

### source_file
- Required
- Filename of the statement this transaction was imported from (e.g. `td_visa_march_2025.pdf`)
- Used for traceability

### needs_review
- Required
- Boolean: `true` or `false`
- Set to `true` when merchant or category confidence is low
- Set to `false` when merchant and category are high-confidence
- Once set to `true` by any agent, preserve it — never downgrade to `false` downstream

### notes
- Optional
- Leave blank unless explicitly provided

### created_at / updated_at
- Format: ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)
- Always required
- `created_at` is set once on first import
- `updated_at` must be updated any time the row is modified (including overwrites)

---

## Data Integrity Rules
- Do not create duplicate transactions (match on `id`)
- If a duplicate `id` is found, overwrite the existing row and update `updated_at`
- Do not guess missing critical fields
- Do not output partial rows
- Do not include extra columns
- Do not reorder columns
- Do not include commentary or explanations in output

---

## Column Order (fixed)
1. id
2. date
3. description
4. normalized_description
5. amount
6. merchant
7. category
8. subcategory
9. account
10. account_type
11. source_file
12. needs_review
13. notes
14. created_at
15. updated_at

---

## Categories & Subcategories (Fixed)

### Income
- Salary
- Bonus
- Interest
- Dividends
- Refund
- Other Income

### Housing
- Rent
- Mortgage
- Property Tax
- HOA
- Home Maintenance

### Utilities
- Electricity
- Water
- Gas
- Internet
- Phone

### Groceries
- Supermarket
- Wholesale Club

### Food & Drink
- Coffee
- Dining Out
- Fast Food
- Bars

### Transportation
- Gas
- Public Transit
- Parking
- Rideshare
- Car Maintenance

### Subscriptions
- Streaming
- Software
- Memberships

### Shopping
- General Merchandise
- Clothing
- Electronics
- Home Goods

### Health
- Medical
- Pharmacy
- Fitness

### Travel
- Flights
- Hotels
- Rental Car
- Activities

### Entertainment
- Movies
- Games
- Events

### Child Care
- Daycare
- After School
- Babysitting

### Transfers
- Inbound
- Outbound

### Payments
- Credit Card
- Mortgage
- Loan
- Insurance

### Misc
- Uncategorized

---

## Output Rules
- Output CSV rows only
- No headers unless explicitly requested
- No markdown formatting
- No extra text
- Boolean fields (`needs_review`) must be lowercase: `true` or `false`
- Empty optional fields must be represented as empty (no placeholder text)
