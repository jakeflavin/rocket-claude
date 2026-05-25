#!/usr/bin/env python3
"""
commit.py  —  enriched.json → CSV append

Writes institution, account, transactions, balance history, and import log
to the data/ CSV files. Safe to run only once per statement (dedup enforced
by enrich.py via file_hash).

Usage: python3 commit.py <enriched.json>
       (must be run from the project root so data/ CSVs are accessible)
"""

import sys
import json
import csv
import uuid
from datetime import datetime, timezone
from pathlib import Path


DATA_DIR = Path("data")

# Exact column order per CSV file
INSTITUTIONS_COLS = ["id", "name", "logo", "primary_color"]

ACCOUNTS_COLS = [
    "id", "name", "institution", "type", "subtype", "currency",
    "balance", "available_balance", "credit_limit",
    "is_hidden", "is_closed", "last_synced_at", "created_at", "updated_at",
]

TRANSACTIONS_COLS = [
    "id", "account_id", "external_id", "amount", "currency", "date",
    "authorized_date", "merchant", "description", "category_id", "subcategory_id",
    "transaction_type", "pending", "is_transfer", "transfer_group", "notes",
    "tags", "location", "created_at", "updated_at", "is_recurring",
    "exclude_from_analytics",
]

BALANCE_HISTORY_COLS = ["id", "account_id", "date", "balance"]

IMPORTS_COLS = ["id", "source", "imported_at", "file_hash", "transaction_count"]


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------

def append_row(filename: str, columns: list[str], row: dict):
    path = DATA_DIR / filename
    with open(path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writerow(row)


def read_csv_rows(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def update_account_balance(account_id: str, balance: float | None, last_synced_at: str):
    """Rewrite accounts.csv updating balance and last_synced_at for the matching row."""
    path = DATA_DIR / "accounts.csv"
    rows = read_csv_rows("accounts.csv")
    updated = False
    for row in rows:
        if row["id"] == account_id:
            if balance is not None:
                row["balance"] = balance
            row["last_synced_at"] = last_synced_at
            row["updated_at"] = last_synced_at
            updated = True
            break

    if not updated:
        return

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=ACCOUNTS_COLS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) != 2:
        print("Usage: commit.py <enriched.json>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)

    meta = data["meta"]
    institution = data["institution"]
    account = data["account"]
    transactions = data["transactions"]
    now = datetime.now(timezone.utc).isoformat()

    # 1. Institution — insert if new
    if not institution["exists_in_csv"]:
        append_row("institutions.csv", INSTITUTIONS_COLS, {
            "id": institution["id"],
            "name": institution["name"],
            "logo": "",
            "primary_color": "",
        })
        print(f"✓ Institution created: {institution['name']} ({institution['id']})")
    else:
        print(f"✓ Institution already exists: {institution['name']}")

    # 2. Account — insert or update balance
    if not account["exists_in_csv"]:
        append_row("accounts.csv", ACCOUNTS_COLS, {
            "id": account["id"],
            "name": account["name"],
            "institution": institution["id"],
            "type": account.get("type", "checking"),
            "subtype": account.get("subtype", "checking"),
            "currency": account.get("currency", "USD"),
            "balance": account.get("balance", ""),
            "available_balance": account.get("available_balance", ""),
            "credit_limit": "",
            "is_hidden": False,
            "is_closed": False,
            "last_synced_at": now,
            "created_at": now,
            "updated_at": now,
        })
        print(f"✓ Account created: {account['name']} ({account['id']})")
    else:
        update_account_balance(account["id"], account.get("balance"), now)
        print(f"✓ Account updated: {account['name']} (balance={account.get('balance')})")

    # 3. Transactions — append all
    for txn in transactions:
        append_row("transactions.csv", TRANSACTIONS_COLS, {
            "id": txn["id"],
            "account_id": txn["account_id"],
            "external_id": txn.get("external_id", ""),
            "amount": txn["amount"],
            "currency": txn.get("currency", "USD"),
            "date": txn["date"],
            "authorized_date": txn.get("authorized_date", txn["date"]),
            "merchant": txn.get("merchant", ""),
            "description": txn.get("description", ""),
            "category_id": txn.get("category_id", ""),
            "subcategory_id": txn.get("subcategory_id", ""),
            "transaction_type": txn.get("transaction_type", "debit"),
            "pending": txn.get("pending", False),
            "is_transfer": txn.get("is_transfer", False),
            "transfer_group": txn.get("transfer_group", ""),
            "notes": txn.get("notes", ""),
            "tags": txn.get("tags", ""),
            "location": txn.get("location", ""),
            "created_at": txn.get("created_at", now),
            "updated_at": txn.get("updated_at", now),
            "is_recurring": txn.get("is_recurring", False),
            "exclude_from_analytics": txn.get("exclude_from_analytics", False),
        })
    print(f"✓ Transactions appended: {len(transactions)}")

    # 4. Account balance history — one row for statement end date
    period_end = meta.get("statement_period", {}).get("end") or now[:10]
    ending_balance = account.get("balance")
    if ending_balance is not None:
        append_row("account_balance_history.csv", BALANCE_HISTORY_COLS, {
            "id": f"abh_{uuid.uuid4().hex[:12]}",
            "account_id": account["id"],
            "date": period_end,
            "balance": ending_balance,
        })
        print(f"✓ Balance history recorded: {period_end} = {ending_balance}")

    # 5. Import log
    append_row("imports.csv", IMPORTS_COLS, {
        "id": f"imp_{uuid.uuid4().hex[:12]}",
        "source": meta.get("source_file", "unknown"),
        "imported_at": now,
        "file_hash": meta.get("file_hash", ""),
        "transaction_count": len(transactions),
    })
    print(f"✓ Import logged (hash={meta.get('file_hash', '')[:16]}...)")

    # Summary
    uncategorized = meta.get("uncategorized_count", 0)
    if uncategorized > 0:
        print(f"\n⚠  {uncategorized} transaction(s) have no category assigned.")
        no_cat = [t for t in transactions if not t.get("category_id")]
        for t in no_cat[:10]:
            print(f"   - {t['date']}  {t['description']}  ({t['amount']})")


if __name__ == "__main__":
    main()
