# CSV Schema

## Column Order (fixed — never reorder)

| #  | Field                    | Type    | Required | Notes                                                        |
|----|--------------------------|---------|----------|--------------------------------------------------------------|
| 1  | `id`                     | string  | ✅        | SHA-256 of `date + amount + description`. Used as React key. |
| 2  | `date`                   | string  | ✅        | `YYYY-MM-DD`                                                 |
| 3  | `description`            | string  | ✅        | Raw text from statement. Never modify.                       |
| 4  | `normalized_description` | string  | ✅        | Clean display name                                           |
| 5  | `amount`                 | number  | ✅        | Negative = expense, Positive = income                        |
| 6  | `merchant`               | string  | ✅        | Extracted vendor name                                        |
| 7  | `category`               | string  | ✅        | Must be from fixed list below                                |
| 8  | `subcategory`            | string  | ⬜        | Optional. From fixed list per category                       |
| 9  | `account`                | string  | ✅        | Human-readable (e.g. "TD Chequing")                          |
| 10 | `account_type`           | string  | ✅        | `checking`, `savings`, or `credit_card`                      |
| 11 | `source_file`            | string  | ✅        | Statement filename for traceability                          |
| 12 | `needs_review`           | boolean | ✅        | `true` = AI-categorized, needs human check                   |
| 13 | `notes`                  | string  | ⬜        | User-editable. Empty if not set.                             |
| 14 | `created_at`             | string  | ✅        | ISO 8601. Set once on first import.                          |
| 15 | `updated_at`             | string  | ✅        | ISO 8601. Updated on every overwrite.                        |

## Amount Convention

- **Expenses**: negative number (e.g. `-5.75`)
- **Income**: positive number (e.g. `3200.00`)
- Display in UI: always show absolute value; use color + sign to indicate direction

## Categories & Subcategories (fixed — never invent new ones)

```
Income          → Salary, Bonus, Interest, Dividends, Refund, Other Income
Housing         → Rent, Mortgage, Property Tax, HOA, Home Maintenance
Utilities       → Electricity, Water, Gas, Internet, Phone
Groceries       → Supermarket, Wholesale Club
Food & Drink    → Coffee, Dining Out, Fast Food, Bars
Transportation  → Gas, Public Transit, Parking, Rideshare, Car Maintenance
Subscriptions   → Streaming, Software, Memberships
Shopping        → General Merchandise, Clothing, Electronics, Home Goods
Health          → Medical, Pharmacy, Fitness
Travel          → Flights, Hotels, Rental Car, Activities
Entertainment   → Movies, Games, Events
Misc            → Uncategorized
```

## Page-Level Filtering Logic

```
Dashboard      → all transactions for current month
Transactions   → all transactions, filterable
Subscriptions  → category === "Subscriptions"
Bills          → category === "Utilities" OR category === "Housing",
                 recurring (same merchant appears in multiple months)
```
