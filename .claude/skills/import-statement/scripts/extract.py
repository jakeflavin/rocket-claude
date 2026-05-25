#!/usr/bin/env python3
"""
extract.py  —  markdown → raw.json

Usage: python3 extract.py <statement.md> <raw.json>
"""

import sys
import json
import re
import hashlib
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_amount(text: str) -> float | None:
    """Parse '$1,234.56' or '1,234.56' or '(1,234.56)' into a float."""
    text = text.strip().replace(",", "")
    negative = text.startswith("(") and text.endswith(")")
    text = text.strip("()$").strip()
    try:
        val = float(text)
        return -val if negative else val
    except ValueError:
        return None


def normalize_date(text: str) -> str | None:
    """Try several date formats and return ISO date string or None."""
    formats = ["%m/%d/%Y", "%m/%d/%y", "%B %d, %Y", "%b %d, %Y",
               "%Y-%m-%d", "%d-%b-%Y"]
    text = text.strip()
    for fmt in formats:
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


# ---------------------------------------------------------------------------
# PNC Parser
# ---------------------------------------------------------------------------

def parse_pnc(lines: list[str]) -> dict:
    """
    Parse a PNC bank statement that has been converted to markdown.
    PNC statements typically show:
      - Account name and type in the header section
      - "Statement Period: MM/DD/YYYY to MM/DD/YYYY"
      - "Ending Balance" and optionally "Available Balance"
      - A transaction table with columns: Date | Description | Debits | Credits | Balance
    """
    account = {
        "institution": "PNC Bank",
        "name": None,
        "type": "checking",
        "subtype": "checking",
        "currency": "USD",
        "ending_balance": None,
        "available_balance": None,
    }
    transactions = []
    period_start = None
    period_end = None

    # --- Account name: look for "Virtual Wallet" / account type headers ---
    acct_name_patterns = [
        r"(Virtual Wallet(?:\s+\w+)*)",
        r"(Performance\s+(?:Checking|Select|Spend))",
        r"(Standard Checking)",
        r"(PNC\s+\w+\s+(?:Checking|Savings|Account))",
    ]
    for line in lines:
        for pat in acct_name_patterns:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                account["name"] = m.group(1).strip()
                if "saving" in account["name"].lower():
                    account["type"] = "savings"
                    account["subtype"] = "savings"
                break
        if account["name"]:
            break

    if not account["name"]:
        # Fallback: grab first line that looks like an account title
        for line in lines[:30]:
            clean = line.strip().lstrip("#").strip()
            if "account" in clean.lower() or "checking" in clean.lower() or "savings" in clean.lower():
                account["name"] = clean
                break
        if not account["name"]:
            account["name"] = "PNC Checking"

    # --- Statement period ---
    period_re = re.compile(
        r"(?:statement\s+period|period|from)[:\s]+(\d{1,2}/\d{1,2}/\d{2,4})\s+(?:to|through|-)\s+(\d{1,2}/\d{1,2}/\d{2,4})",
        re.IGNORECASE,
    )
    for line in lines:
        m = period_re.search(line)
        if m:
            period_start = normalize_date(m.group(1))
            period_end = normalize_date(m.group(2))
            break

    # --- Balances ---
    ending_re = re.compile(r"ending\s+balance[:\s]+\$?([\d,]+\.\d{2})", re.IGNORECASE)
    avail_re = re.compile(r"available\s+balance[:\s]+\$?([\d,]+\.\d{2})", re.IGNORECASE)
    for line in lines:
        m = ending_re.search(line)
        if m and account["ending_balance"] is None:
            account["ending_balance"] = parse_amount(m.group(1))
        m = avail_re.search(line)
        if m and account["available_balance"] is None:
            account["available_balance"] = parse_amount(m.group(1))

    # --- Transactions ---
    # PNC markdown tables look like:
    #   | Date | Description | Debits | Credits | Balance |
    #   |------|-------------|--------|---------|---------|
    #   | 01/03/2024 | STARBUCKS #1234 | $4.75 | | $1,234.56 |
    in_transaction_table = False
    header_seen = False

    for line in lines:
        stripped = line.strip()

        # Detect start of transaction table
        if not in_transaction_table:
            if re.search(r"\|\s*date\s*\|", stripped, re.IGNORECASE) and re.search(
                r"debit|credit|amount|withdrawal|deposit", stripped, re.IGNORECASE
            ):
                in_transaction_table = True
                header_seen = False
                continue

        if not in_transaction_table:
            continue

        # Skip separator row
        if re.match(r"^\|[-| ]+\|$", stripped):
            header_seen = True
            continue

        # Stop at blank line or new section header
        if not stripped or stripped.startswith("#"):
            in_transaction_table = False
            continue

        # Parse table row
        if "|" not in stripped:
            continue

        cells = [c.strip() for c in stripped.split("|") if c.strip()]
        if len(cells) < 3:
            continue

        # cells[0] = date, cells[1] = description, then debits/credits
        date_str = normalize_date(cells[0])
        if not date_str:
            continue

        description = cells[1].strip() if len(cells) > 1 else ""

        # Determine amount: debit is negative, credit is positive
        debit_val = parse_amount(cells[2]) if len(cells) > 2 else None
        credit_val = parse_amount(cells[3]) if len(cells) > 3 else None

        if debit_val is not None and debit_val != 0:
            amount = -abs(debit_val)
            txn_type = "debit"
        elif credit_val is not None and credit_val != 0:
            amount = abs(credit_val)
            txn_type = "credit"
        else:
            continue  # no amount found, skip

        transactions.append({
            "date": date_str,
            "amount": amount,
            "description": description,
            "transaction_type": txn_type,
        })

    return account, transactions, period_start, period_end


# ---------------------------------------------------------------------------
# Generic fallback parser
# ---------------------------------------------------------------------------

def parse_generic(lines: list[str]) -> dict:
    """
    Heuristic parser for unknown bank statement formats.
    Looks for lines that contain a date and a dollar amount.
    """
    account = {
        "institution": "Unknown",
        "name": "Imported Account",
        "type": "checking",
        "subtype": "checking",
        "currency": "USD",
        "ending_balance": None,
        "available_balance": None,
    }
    transactions = []
    period_start = None
    period_end = None

    # Try to find the institution name near the top
    for line in lines[:20]:
        clean = line.strip().lstrip("#").strip()
        if len(clean) > 3 and not clean.startswith("|") and not clean.startswith("-"):
            account["institution"] = clean
            account["name"] = clean
            break

    # Statement period
    period_re = re.compile(
        r"(\d{1,2}/\d{1,2}/\d{2,4})\s*(?:to|through|-)\s*(\d{1,2}/\d{1,2}/\d{2,4})",
        re.IGNORECASE,
    )
    for line in lines:
        m = period_re.search(line)
        if m:
            period_start = normalize_date(m.group(1))
            period_end = normalize_date(m.group(2))
            break

    # Ending balance
    bal_re = re.compile(r"(?:ending|closing|final)?\s*balance[:\s]+\$?([\d,]+\.\d{2})", re.IGNORECASE)
    for line in lines:
        m = bal_re.search(line)
        if m:
            account["ending_balance"] = parse_amount(m.group(1))
            break

    # Transaction lines: date + description + amount
    txn_line_re = re.compile(
        r"(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)"   # date
        r"\s+(.+?)\s+"                                    # description
        r"\(?\$?([\d,]+\.\d{2})\)?$",                    # amount at end
        re.IGNORECASE,
    )
    for line in lines:
        m = txn_line_re.search(line.strip())
        if not m:
            continue
        date_str = normalize_date(m.group(1))
        if not date_str:
            continue
        description = m.group(2).strip()
        raw_amount = parse_amount(m.group(3))
        if raw_amount is None:
            continue
        # Heuristic: if line contains "credit", "deposit", "payment" treat as positive
        lower = line.lower()
        if any(w in lower for w in ("credit", "deposit", "payment received", "refund")):
            amount = abs(raw_amount)
            txn_type = "credit"
        else:
            amount = -abs(raw_amount)
            txn_type = "debit"

        transactions.append({
            "date": date_str,
            "amount": amount,
            "description": description,
            "transaction_type": txn_type,
        })

    return account, transactions, period_start, period_end


# ---------------------------------------------------------------------------
# Bank detection
# ---------------------------------------------------------------------------

def detect_bank(text: str) -> str:
    text_lower = text.lower()
    if "pnc" in text_lower or "virtual wallet" in text_lower:
        return "PNC"
    if "chase" in text_lower:
        return "Chase"
    if "bank of america" in text_lower:
        return "Bank of America"
    if "wells fargo" in text_lower:
        return "Wells Fargo"
    if "citibank" in text_lower or "citi bank" in text_lower:
        return "Citibank"
    return "Unknown"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) != 3:
        print("Usage: extract.py <statement.md> <raw.json>", file=sys.stderr)
        sys.exit(1)

    md_path = sys.argv[1]
    out_path = sys.argv[2]

    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    bank = detect_bank(content)

    if bank == "PNC":
        account, transactions, period_start, period_end = parse_pnc(lines)
        parser = "pnc"
        needs_review = False
    else:
        account, transactions, period_start, period_end = parse_generic(lines)
        parser = "generic"
        needs_review = True

    # Hash the source PDF is not available here; hash the markdown instead
    # (the PDF hash is computed in enrich.py from the original file path stored in meta)
    md_hash = hashlib.sha256(content.encode()).hexdigest()

    result = {
        "meta": {
            "source_file": str(Path(md_path).stem),
            "md_hash": md_hash,
            "bank": bank,
            "parser": parser,
            "needs_review": needs_review,
            "statement_period": {
                "start": period_start,
                "end": period_end,
            },
            "imported_at": datetime.now(timezone.utc).isoformat(),
        },
        "account": account,
        "transactions": transactions,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Bank: {bank}")
    print(f"Parser: {parser}")
    print(f"Needs review: {needs_review}")
    print(f"Account: {account['name']} @ {account['institution']}")
    print(f"Period: {period_start} → {period_end}")
    print(f"Transactions extracted: {len(transactions)}")
    print(f"Output: {out_path}")


if __name__ == "__main__":
    main()
