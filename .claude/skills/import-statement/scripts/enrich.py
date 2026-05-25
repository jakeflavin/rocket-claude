#!/usr/bin/env python3
"""
enrich.py  —  raw.json → enriched.json

Adds IDs, matches/creates institution and account records, applies
categorization rules, extracts merchant names, detects transfers.

Usage: python3 enrich.py <raw.json> <enriched.json>
       (must be run from the project root so data/ CSVs are accessible)
"""

import sys
import json
import csv
import uuid
import re
from datetime import datetime, timezone
from pathlib import Path


DATA_DIR = Path("data")


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------

def read_csv(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_imports() -> list[dict]:
    return read_csv("imports.csv")


def load_institutions() -> list[dict]:
    return read_csv("institutions.csv")


def load_accounts() -> list[dict]:
    return read_csv("accounts.csv")


def load_rules() -> list[dict]:
    rows = read_csv("rules.csv")
    # Sort by priority ascending (lower number = higher priority)
    return sorted(rows, key=lambda r: int(r.get("priority", 999)))


def load_categories() -> dict[str, dict]:
    """Returns a dict keyed by id."""
    rows = read_csv("categories.csv")
    return {r["id"]: r for r in rows}


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def check_duplicate(file_hash: str) -> bool:
    """Return True if this file_hash already exists in imports.csv."""
    for row in load_imports():
        if row.get("file_hash") == file_hash:
            return True
    return False


# ---------------------------------------------------------------------------
# Institution matching
# ---------------------------------------------------------------------------

def match_or_create_institution(name: str) -> tuple[str, bool]:
    """
    Returns (institution_id, exists_in_csv).
    Matches on case-insensitive name contains.
    """
    name_lower = name.lower().strip()
    for inst in load_institutions():
        if name_lower in inst.get("name", "").lower() or inst.get("name", "").lower() in name_lower:
            return inst["id"], True
    new_id = f"inst_{uuid.uuid4().hex[:12]}"
    return new_id, False


# ---------------------------------------------------------------------------
# Account matching
# ---------------------------------------------------------------------------

def match_or_create_account(account_name: str, institution_id: str) -> tuple[str, bool]:
    """
    Returns (account_id, exists_in_csv).
    Matches by institution and case-insensitive name.
    """
    name_lower = account_name.lower().strip()
    for acct in load_accounts():
        if (acct.get("institution", "").lower() == institution_id.lower() or
                acct.get("institution", "") == institution_id):
            if name_lower in acct.get("name", "").lower() or acct.get("name", "").lower() in name_lower:
                return acct["id"], True
    new_id = f"acc_{uuid.uuid4().hex[:12]}"
    return new_id, False


# ---------------------------------------------------------------------------
# Merchant extraction
# ---------------------------------------------------------------------------

# Patterns to strip from PNC descriptions (trailing location tokens)
_LOCATION_SUFFIXES = re.compile(
    r"\s+(?:[A-Z]{2}\s+\d{5}|[A-Z]{2,3}\s+US|US\s*$|\d{10,}|#\d+\s*$)",
    re.IGNORECASE,
)
_TRAILING_JUNK = re.compile(r"\s+\d{4,}\s*$")  # trailing reference numbers


def extract_merchant(description: str) -> str:
    """Best-effort merchant name from raw description."""
    name = description.strip()
    name = _LOCATION_SUFFIXES.sub("", name)
    name = _TRAILING_JUNK.sub("", name)
    # Title-case if ALL CAPS
    if name == name.upper() and len(name) > 3:
        name = name.title()
    return name.strip()


# ---------------------------------------------------------------------------
# Transfer detection
# ---------------------------------------------------------------------------

_TRANSFER_PATTERNS = re.compile(
    r"\b(transfer|xfer|zelle|venmo|paypal|cashapp|cash app|wire|ach credit|ach debit|"
    r"online transfer|internal transfer|savings transfer)\b",
    re.IGNORECASE,
)


def is_transfer(description: str) -> bool:
    return bool(_TRANSFER_PATTERNS.search(description))


# ---------------------------------------------------------------------------
# Categorization
# ---------------------------------------------------------------------------

def apply_rules(description: str, merchant: str, rules: list[dict], categories: dict) -> tuple[str | None, str | None]:
    """
    Walk rules in priority order. Return (category_id, subcategory_id) or (None, None).
    subcategory_id is the matched category if it has a parent; category_id is the parent.
    """
    for rule in rules:
        if rule.get("enabled", "true").lower() != "true":
            continue

        field = rule.get("field", "description").lower()
        operator = rule.get("operator", "contains").lower()
        value = rule.get("value", "")
        target = merchant if field == "merchant" else description

        matched = False
        if operator == "contains":
            matched = value.lower() in target.lower()
        elif operator == "equals":
            matched = value.lower() == target.lower()
        elif operator == "starts_with":
            matched = target.lower().startswith(value.lower())
        elif operator == "ends_with":
            matched = target.lower().endswith(value.lower())

        if matched:
            cat_id = rule.get("category_id")
            if not cat_id:
                continue
            cat = categories.get(cat_id)
            if cat and cat.get("parent_id"):
                # matched category is a subcategory
                return cat["parent_id"], cat_id
            else:
                return cat_id, None

    return None, None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) != 3:
        print("Usage: enrich.py <raw.json> <enriched.json>", file=sys.stderr)
        sys.exit(1)

    raw_path = sys.argv[1]
    out_path = sys.argv[2]

    with open(raw_path, encoding="utf-8") as f:
        data = json.load(f)

    meta = data["meta"]
    raw_account = data["account"]
    raw_transactions = data["transactions"]

    # --- Dedup check ---
    file_hash = meta.get("md_hash", "")
    if check_duplicate(file_hash):
        print(f"ERROR: This statement has already been imported (hash: {file_hash})", file=sys.stderr)
        sys.exit(1)

    # --- Institution ---
    inst_name = raw_account.get("institution", "Unknown")
    inst_id, inst_exists = match_or_create_institution(inst_name)

    # --- Account ---
    acct_name = raw_account.get("name", "Imported Account")
    acct_id, acct_exists = match_or_create_account(acct_name, inst_id)

    # --- Load rules + categories ---
    rules = load_rules()
    categories = load_categories()

    # --- Enrich transactions ---
    now = datetime.now(timezone.utc).isoformat()
    enriched_transactions = []
    uncategorized_count = 0

    for txn in raw_transactions:
        description = txn.get("description", "")
        merchant = extract_merchant(description)
        category_id, subcategory_id = apply_rules(description, merchant, rules, categories)

        if category_id is None:
            uncategorized_count += 1

        enriched_transactions.append({
            "id": f"txn_{uuid.uuid4().hex[:12]}",
            "account_id": acct_id,
            "external_id": None,
            "amount": txn["amount"],
            "currency": raw_account.get("currency", "USD"),
            "date": txn["date"],
            "authorized_date": txn["date"],
            "merchant": merchant,
            "description": description,
            "category_id": category_id,
            "subcategory_id": subcategory_id,
            "transaction_type": txn.get("transaction_type", "debit"),
            "pending": False,
            "is_transfer": is_transfer(description),
            "transfer_group": None,
            "notes": None,
            "tags": None,
            "location": None,
            "created_at": now,
            "updated_at": now,
            "is_recurring": False,
            "exclude_from_analytics": False,
        })

    enriched = {
        "meta": {
            **meta,
            "file_hash": file_hash,
            "uncategorized_count": uncategorized_count,
        },
        "institution": {
            "id": inst_id,
            "name": inst_name,
            "exists_in_csv": inst_exists,
        },
        "account": {
            "id": acct_id,
            "name": acct_name,
            "institution_id": inst_id,
            "type": raw_account.get("type", "checking"),
            "subtype": raw_account.get("subtype", "checking"),
            "currency": raw_account.get("currency", "USD"),
            "balance": raw_account.get("ending_balance"),
            "available_balance": raw_account.get("available_balance"),
            "credit_limit": None,
            "is_hidden": False,
            "is_closed": False,
            "last_synced_at": now,
            "created_at": now,
            "updated_at": now,
            "exists_in_csv": acct_exists,
        },
        "transactions": enriched_transactions,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2)

    print(f"Institution: {inst_name} ({'exists' if inst_exists else 'new'}, id={inst_id})")
    print(f"Account: {acct_name} ({'exists' if acct_exists else 'new'}, id={acct_id})")
    print(f"Transactions enriched: {len(enriched_transactions)}")
    print(f"Uncategorized: {uncategorized_count}")
    print(f"Output: {out_path}")


if __name__ == "__main__":
    main()
