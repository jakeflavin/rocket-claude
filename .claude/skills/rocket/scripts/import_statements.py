#!/usr/bin/env python3
"""
import_statements.py

Main pipeline for importing bank and credit card statements.

Steps:
  1. Validate input folder
  2. Convert PDFs to text
  3. Parse all statements into raw transactions
  4. Normalize and categorize each transaction
  5. Deduplicate and merge into output CSV
  6. Clean up input files

Usage:
  python scripts/import_statements.py
"""

import os
import re
import csv
import sys
import hashlib
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths  (all derived from script location — works regardless of cwd)
# ---------------------------------------------------------------------------
SCRIPTS_DIR  = Path(__file__).resolve().parent          # .../skills/rocket/scripts/
SKILL_DIR    = SCRIPTS_DIR.parent                       # .../skills/rocket/
PROJECT_DIR  = SKILL_DIR.parents[2]                     # workspace/rocket-claude/
INPUT_DIR    = PROJECT_DIR / "statements"
OUTPUT_CSV   = PROJECT_DIR / "data" / "transactions.csv"
PDF_SCRIPT   = SCRIPTS_DIR / "pdf_to_text.py"

# Make categorize importable from the scripts directory
sys.path.insert(0, str(SCRIPTS_DIR))

# ---------------------------------------------------------------------------
# CSV column order (must match csv_rules.md)
# ---------------------------------------------------------------------------
COLUMNS = [
    "id",
    "date",
    "description",
    "normalized_description",
    "amount",
    "merchant",
    "category",
    "subcategory",
    "account",
    "account_type",
    "source_file",
    "needs_review",
    "notes",
    "created_at",
    "updated_at",
]

OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def make_id(date: str, amount: str, description: str) -> str:
    raw = f"{date}{amount}{description}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def normalize_description(raw: str) -> str:
    """Strip bank prefixes, transaction IDs, noise; title-case result."""
    text = raw

    # Amex CSV format: "MERCHANT      CITY        STATE" separated by 3+ spaces.
    # Grab only the merchant portion (everything before the first wide gap).
    if re.search(r"\s{3,}", text):
        text = re.split(r"\s{3,}", text)[0]

    # Strip leading card/terminal numbers (e.g. "4488 ", "2300 ")
    text = re.sub(r"^\d{4}\s+", "", text)

    # Strip PNC-style purchase prefixes
    text = re.sub(
        r"^(recurring debit card|debit card purchase|debit card credit|pos purchase|pos debit|ach pmt|ach)\s+",
        "", text, flags=re.IGNORECASE,
    )

    # Strip trailing location noise: store numbers, zip codes, 2-letter state
    text = re.sub(r"\s+\d{4,5}$", "", text)
    text = re.sub(r"\s+[A-Z]{2}$", "", text)
    text = re.sub(r"\s+\d+\s+[A-Z]{2}$", "", text)

    # Strip phone numbers (e.g. "866-579-7172")
    text = re.sub(r"\b\d{3}[\-\.]\d{3}[\-\.]\d{4}\b", "", text)

    # Strip common trailing transaction IDs (require separator to avoid stripping words like "refund")
    text = re.sub(r"[#*]\w+", "", text)
    text = re.sub(r"\b(ref|txn|tran|trans|no)\s*[:#*]\s*[\w\-]+", "", text, flags=re.IGNORECASE)

    text = re.sub(r"\s+", " ", text).strip()
    return text.title()


MERCHANT_ALIASES = [
    (r"^spotify",                    "Spotify"),
    (r"^netflix",                    "Netflix"),
    (r"^disneyplus|^disney\+",       "Disney+"),
    (r"^google.*(?:youtube|tv)|^youtube", "YouTube TV"),
    (r"^apple\.com",                 "Apple"),
    (r"^claude\.ai",                 "Claude.Ai"),
    (r"^figma",                      "Figma"),
    (r"^chewy",                      "Chewy"),
    (r"^amazon",                     "Amazon"),
    (r"^wal.?mart|^wm supercenter",  "Walmart"),
    (r"^costco",                     "Costco"),
    (r"^verizon",                    "Verizon"),
]


def extract_merchant(normalized: str) -> str:
    """Return a canonical merchant name if known, otherwise first two words."""
    for pattern, canonical in MERCHANT_ALIASES:
        if re.match(pattern, normalized, re.IGNORECASE):
            return canonical
    words = normalized.split()
    return " ".join(words[:2]) if len(words) >= 2 else normalized


def infer_account_info(filename: str) -> tuple[str, str]:
    """
    Infer account name and type from filename.
    Checks the full stem for keywords, not just underscore-split parts.

    account_type keywords: chequing/checking → checking
                           savings → savings
                           visa/mc/amex/mastercard/credit/express → credit_card
    """
    stem = Path(filename).stem.lower()

    account_type = "checking"  # default
    if re.search(r"\b(chequing|checking)\b", stem):
        account_type = "checking"
    elif re.search(r"\b(savings?)\b", stem):
        account_type = "savings"
    elif re.search(r"\b(visa|mc|amex|american express|mastercard|credit|express)\b", stem):
        account_type = "credit_card"

    parts = re.split(r"[\s_\-]+", stem)
    account = " ".join(p.title() for p in parts[:2])
    return account, account_type


# ---------------------------------------------------------------------------
# Step 1: Input validation
# ---------------------------------------------------------------------------

def get_input_files() -> tuple[list[Path], list[Path]]:
    pdfs = sorted(INPUT_DIR.glob("*.pdf"))
    csvs = sorted(INPUT_DIR.glob("*.csv"))
    return pdfs, csvs


# ---------------------------------------------------------------------------
# Step 2: PDF → text
# ---------------------------------------------------------------------------

def convert_pdfs(pdfs: list[Path]) -> list[Path]:
    """Convert each PDF to .txt. Returns list of successfully converted .txt paths."""
    txt_files = []
    for pdf in pdfs:
        print(f"Converting PDF: {pdf.name}")
        result = subprocess.run(
            [sys.executable, str(PDF_SCRIPT), str(pdf)],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            txt_path = pdf.with_suffix(".txt")
            if txt_path.exists():
                txt_files.append(txt_path)
                print(f"  → {txt_path.name}")
            else:
                print(f"  ERROR: PDF converted but .txt not found: {txt_path}", file=sys.stderr)
        else:
            print(f"  ERROR: PDF conversion failed: {pdf.name}\n{result.stderr}", file=sys.stderr)
    return txt_files


# ---------------------------------------------------------------------------
# Step 3: Parse statements
# ---------------------------------------------------------------------------

def _detect_statement_period(lines: list[str]) -> tuple[datetime | None, datetime | None]:
    """Scan for 'For the period MM/DD/YYYY to MM/DD/YYYY' and return (start, end)."""
    period_re = re.compile(
        r"[Ff]or the period\s+(\d{1,2}/\d{1,2}/\d{4})\s+to\s+(\d{1,2}/\d{1,2}/\d{4})"
    )
    for line in lines:
        m = period_re.search(line)
        if m:
            try:
                return (
                    datetime.strptime(m.group(1), "%m/%d/%Y"),
                    datetime.strptime(m.group(2), "%m/%d/%Y"),
                )
            except ValueError:
                pass
    return None, None


def _infer_year(month: int, day: int, period_start: datetime | None, period_end: datetime | None) -> int:
    """Pick the year that places MM/DD within the statement period, else use current year."""
    if period_start and period_end:
        for year in range(period_start.year, period_end.year + 1):
            try:
                d = datetime(year, month, day)
                if period_start <= d <= period_end:
                    return year
            except ValueError:
                pass
        return period_end.year
    return datetime.now().year


def parse_txt(txt_path: Path) -> list[dict]:
    """
    Parse a raw text statement into transaction dicts.

    Handles two date formats:
      - Full:    YYYY-MM-DD or MM/DD/YYYY  <description>  <amount>
      - Partial: MM/DD  <amount>  <description>  (PNC-style, year inferred from period header)

    Multi-line descriptions are joined when a continuation line contains no date.
    """
    transactions = []
    source = txt_path.name

    with open(txt_path, encoding="utf-8") as f:
        lines = [l.rstrip() for l in f]

    period_start, period_end = _detect_statement_period(lines)

    # MM/DD (no year)
    short_date_re = re.compile(r"^(\d{1,2}/\d{1,2})\s+([\d,]+\.\d{2})\s+(.+)$")
    # Full date formats
    full_date_re = re.compile(
        r"(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}-\d{2}-\d{4})"
    )
    amount_re = re.compile(r"(-?\$?[\d,]+\.\d{2})")

    # Daily balance detail rows start with another MM/DD amount pattern in the description
    balance_row_re = re.compile(r"^\d{1,2}/\d{2}\s+[\d,]+\.\d{2}")
    # Keywords that indicate a summary/total line, not a real transaction
    skip_keywords_re = re.compile(
        r"\b(daily balance|total withdrawals|total deposits|total charges|"
        r"opening balance|closing balance|beginning balance|ending balance|"
        r"service charge|new balance|previous balance|account balance|"
        r"total debits|total credits|total additions)\b",
        re.IGNORECASE,
    )

    # Section tracking: True = additions (positive), False = deductions (negative)
    is_addition = True
    ADDITION_HEADERS = re.compile(r"deposits and other additions", re.IGNORECASE)
    DEDUCTION_HEADERS = re.compile(
        r"(withdrawals and purchases|banking/debit card|banking machine|deductions|online and electronic banking deductions)",
        re.IGNORECASE,
    )

    pending: dict | None = None

    def flush(txn):
        if txn:
            transactions.append(txn)

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Track which section we're in to determine sign
        if ADDITION_HEADERS.search(stripped):
            is_addition = True
        elif DEDUCTION_HEADERS.search(stripped):
            is_addition = False

        # Skip known summary/total lines before any match attempt
        if skip_keywords_re.search(stripped):
            continue

        # Try MM/DD amount description (PNC-style)
        m = short_date_re.match(stripped)
        if m:
            raw_date, raw_amount, description = m.group(1), m.group(2), m.group(3)
            # Skip daily balance detail rows — description starts with another MM/DD amount
            if balance_row_re.match(description):
                pending = None
                continue
            flush(pending)
            month, day = map(int, raw_date.split("/"))
            year = _infer_year(month, day, period_start, period_end)
            try:
                date_str = datetime(year, month, day).strftime("%Y-%m-%d")
            except ValueError:
                pending = None
                continue
            amount = raw_amount.replace(",", "")
            if not is_addition:
                amount = "-" + amount
            pending = {
                "date": date_str,
                "description": description.strip(),
                "amount": amount,
                "source_file": source,
            }
            continue

        # Try full date formats
        date_match = full_date_re.search(stripped)
        amount_match = amount_re.search(stripped)
        if date_match and amount_match:
            flush(pending)
            raw_date = date_match.group(1)
            raw_amount = amount_match.group(1).replace("$", "").replace(",", "")
            try:
                if "/" in raw_date:
                    parsed_date = datetime.strptime(raw_date, "%m/%d/%Y")
                elif raw_date[2] == "-" and len(raw_date) == 10:
                    parsed_date = datetime.strptime(raw_date, "%d-%m-%Y")
                else:
                    parsed_date = datetime.strptime(raw_date, "%Y-%m-%d")
                date_str = parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                pending = None
                continue
            date_end = date_match.end()
            amount_start = amount_match.start()
            description = stripped[date_end:amount_start].strip(" \t-|") or stripped
            if not is_addition and not raw_amount.startswith("-"):
                raw_amount = "-" + raw_amount
            pending = {
                "date": date_str,
                "description": description,
                "amount": raw_amount,
                "source_file": source,
            }
            continue

        # Continuation line — only short fragments that look like truncated merchant names
        if (
            pending
            and stripped
            and len(stripped) <= 20
            and not re.match(r"^(Date|Page|For |Virtual|PNC|Account|There were|Banking|Deposits)", stripped, re.IGNORECASE)
            and not amount_re.search(stripped)
        ):
            pending["description"] = (pending["description"] + " " + stripped).strip()

    flush(pending)

    print(f"  Parsed {len(transactions)} transactions from {txt_path.name}")
    return transactions


def parse_csv(csv_path: Path) -> list[dict]:
    """
    Parse a CSV statement export into transaction dicts.

    Attempts to auto-detect common column name variants across institutions.
    """
    transactions = []
    source = csv_path.name

    date_keys = ["date", "transaction date", "trans date", "posted date"]
    desc_keys = ["description", "memo", "transaction description", "details", "narrative"]
    amount_keys = ["amount", "debit", "credit", "transaction amount"]

    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        headers = [h.lower().strip() for h in (reader.fieldnames or [])]

        def find_col(candidates):
            for c in candidates:
                for h in headers:
                    if c in h:
                        return h
            return None

        date_col = find_col(date_keys)
        desc_col = find_col(desc_keys)
        amount_col = find_col(amount_keys)

        if not all([date_col, desc_col, amount_col]):
            print(f"ERROR: Could not detect required columns in {csv_path.name}. Found: {headers}", file=sys.stderr)
            return []

        for row in reader:
            normalized_row = {k.lower().strip(): v for k, v in row.items()}

            raw_date = normalized_row.get(date_col, "").strip()
            description = normalized_row.get(desc_col, "").strip()
            raw_amount = normalized_row.get(amount_col, "").strip().replace("$", "").replace(",", "")

            if not raw_date or not description or not raw_amount:
                continue

            for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y"):
                try:
                    parsed_date = datetime.strptime(raw_date, fmt)
                    date_str = parsed_date.strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue
            else:
                print(f"WARNING: Could not parse date: {raw_date} in {csv_path.name}", file=sys.stderr)
                continue

            transactions.append({
                "date": date_str,
                "description": description,
                "amount": raw_amount,
                "source_file": source,
            })

    print(f"  Parsed {len(transactions)} transactions from {csv_path.name}")
    return transactions


# ---------------------------------------------------------------------------
# Step 4: Enrich transactions
# ---------------------------------------------------------------------------

def enrich(transactions: list[dict]) -> list[dict]:
    """Normalize, extract merchant, categorize, generate id and timestamps."""
    from categorize import categorize

    enriched = []
    ts = now_iso()

    for t in transactions:
        norm_desc = normalize_description(t["description"])
        merchant = extract_merchant(norm_desc)
        account, account_type = infer_account_info(t["source_file"])

        # Credit cards list charges as positive — negate so expenses are negative
        amount = t["amount"]
        if account_type == "credit_card":
            try:
                amount = str(-float(amount))
            except ValueError:
                pass

        category, subcategory, needs_review = categorize(norm_desc, merchant)

        txn_id = make_id(t["date"], t["amount"], t["description"])

        enriched.append({
            "id": txn_id,
            "date": t["date"],
            "description": t["description"],
            "normalized_description": norm_desc,
            "amount": amount,
            "merchant": merchant,
            "category": category,
            "subcategory": subcategory,
            "account": account,
            "account_type": account_type,
            "source_file": t["source_file"],
            "needs_review": str(needs_review).lower(),
            "notes": "",
            "created_at": ts,
            "updated_at": ts,
        })

    return enriched


# ---------------------------------------------------------------------------
# Step 5: Deduplicate and merge
# ---------------------------------------------------------------------------

def load_existing() -> dict[str, dict]:
    """Load existing output CSV into a dict keyed by id."""
    if not OUTPUT_CSV.exists():
        return {}

    existing = {}
    with open(OUTPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            existing[row["id"]] = row

    print(f"Loaded {len(existing)} existing transactions.")
    return existing


def merge(existing: dict[str, dict], new_rows: list[dict]) -> dict[str, dict]:
    """Merge new rows into existing, overwriting on matching id."""
    added = 0
    overwritten = 0
    ts = now_iso()

    for row in new_rows:
        txn_id = row["id"]
        if txn_id in existing:
            row["created_at"] = existing[txn_id]["created_at"]
            row["updated_at"] = ts
            existing[txn_id] = row
            overwritten += 1
        else:
            existing[txn_id] = row
            added += 1

    print(f"Merge: {added} added, {overwritten} overwritten.")
    return existing


# ---------------------------------------------------------------------------
# Step 6: Write output
# ---------------------------------------------------------------------------

def write_output(rows: dict[str, dict]):
    """Write all rows to output CSV sorted by date descending."""
    sorted_rows = sorted(rows.values(), key=lambda r: r["date"], reverse=True)

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(sorted_rows)

    print(f"Written: {OUTPUT_CSV} ({len(sorted_rows)} rows)")


# ---------------------------------------------------------------------------
# Step 7: Cleanup
# ---------------------------------------------------------------------------

def cleanup(files: list[Path], failed: set[str]):
    """Delete processed input files. Leave failed files in place."""
    for f in files:
        if f.name in failed:
            print(f"Leaving failed file: {f.name}")
            continue
        try:
            f.unlink()
        except Exception as e:
            print(f"ERROR: Could not delete {f.name}: {e}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Step 1: Validate input
    pdfs, csvs = get_input_files()
    if not pdfs and not csvs:
        print("No statements found in statements/. Please add PDF or CSV files and re-run.")
        sys.exit(1)

    print(f"Found {len(pdfs)} PDF(s) and {len(csvs)} CSV(s).")

    failed_files: set[str] = set()
    all_input_files: list[Path] = list(pdfs) + list(csvs)

    # Step 2: Convert PDFs
    txt_files = []
    if pdfs:
        txt_files = convert_pdfs(pdfs)
        for pdf in pdfs:
            if pdf.with_suffix(".txt") not in txt_files:
                failed_files.add(pdf.name)
        all_input_files += txt_files

    # Step 3: Parse all statements
    all_transactions = []

    for txt in txt_files:
        try:
            all_transactions += parse_txt(txt)
        except Exception as e:
            print(f"ERROR: Failed to parse {txt.name}: {e}", file=sys.stderr)
            failed_files.add(txt.stem + ".pdf")

    for csv_path in csvs:
        try:
            parsed = parse_csv(csv_path)
            if not parsed:
                failed_files.add(csv_path.name)
            else:
                all_transactions += parsed
        except Exception as e:
            print(f"ERROR: Failed to parse {csv_path.name}: {e}", file=sys.stderr)
            failed_files.add(csv_path.name)

    if not all_transactions:
        print("ERROR: No transactions could be parsed from any statement.", file=sys.stderr)
        sys.exit(1)

    print(f"Total transactions parsed: {len(all_transactions)}")

    # Step 4: Enrich
    print("Categorizing transactions...")
    enriched = enrich(all_transactions)

    # Step 5: Merge
    existing = load_existing()
    merged = merge(existing, enriched)

    # Step 6: Write output
    try:
        write_output(merged)
    except Exception as e:
        print(f"ERROR: Failed to write output CSV: {e}", file=sys.stderr)
        print("Input files will NOT be deleted.")
        sys.exit(1)

    # Step 7: Cleanup
    cleanup(all_input_files, failed_files)

    needs_review_count = sum(1 for r in merged.values() if r.get("needs_review") == "true")
    print(f"Done. {needs_review_count} transaction(s) flagged for review.")


if __name__ == "__main__":
    main()
