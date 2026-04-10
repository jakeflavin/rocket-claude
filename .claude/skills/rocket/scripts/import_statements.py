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
import logging
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"
LOG_DIR = BASE_DIR / "logs"
OUTPUT_CSV = OUTPUT_DIR / "transactions.csv"
LOG_FILE = LOG_DIR / "import.log"
PDF_SCRIPT = Path(__file__).resolve().parent / "pdf_to_text.py"

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

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOG_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
INPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def make_id(date: str, amount: str, description: str) -> str:
    raw = f"{date}{amount}{description}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def normalize_description(raw: str) -> str:
    """Strip transaction IDs, normalize whitespace, title-case."""
    text = raw
    # Remove common trailing codes like #12345, REF*ABC, TXN:XYZ
    text = re.sub(r"[#*]\w+", "", text)
    text = re.sub(r"\b(ref|txn|tran|trans|id|no)[\s:]*[\w\-]+", "", text, flags=re.IGNORECASE)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text.title()


def extract_merchant(normalized: str) -> str:
    """Best-effort merchant extraction — first two words of normalized description."""
    words = normalized.split()
    return " ".join(words[:2]) if len(words) >= 2 else normalized


def infer_account_info(filename: str) -> tuple[str, str]:
    """
    Infer account name and type from filename.
    Expects filenames like: td_chequing_march.pdf, amex_gold_march.csv

    Naming convention:
      <institution>_<account>_<period>.<ext>
      account_type keywords: chequing/checking → checking
                             savings → savings
                             visa/mc/amex/mastercard/credit → credit_card
    """
    stem = Path(filename).stem.lower()
    parts = stem.replace("-", "_").split("_")

    account_type = "checking"  # default
    for part in parts:
        if part in ("chequing", "checking"):
            account_type = "checking"
        elif part in ("savings", "saving"):
            account_type = "savings"
        elif part in ("visa", "mc", "amex", "mastercard", "credit", "card"):
            account_type = "credit_card"

    # Human-readable account: first two parts title-cased
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
        log.info(f"Converting PDF: {pdf.name}")
        result = subprocess.run(
            [sys.executable, str(PDF_SCRIPT), str(pdf)],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            txt_path = pdf.with_suffix(".txt")
            if txt_path.exists():
                txt_files.append(txt_path)
                log.info(f"  → {txt_path.name}")
            else:
                log.error(f"  PDF converted but .txt not found: {txt_path}")
        else:
            log.error(f"  PDF conversion failed: {pdf.name}\n{result.stderr}")
    return txt_files


# ---------------------------------------------------------------------------
# Step 3: Parse statements
# ---------------------------------------------------------------------------

def parse_txt(txt_path: Path) -> list[dict]:
    """
    Parse a raw text statement into transaction dicts.

    Looks for lines matching common patterns:
      YYYY-MM-DD  <description>  <amount>
      MM/DD/YYYY  <description>  <amount>

    This is a best-effort heuristic parser. Real statements vary — adjust
    the regex patterns here once you have real samples to test against.
    """
    transactions = []
    source = txt_path.name

    date_pattern = re.compile(
        r"(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}-\d{2}-\d{4})"
    )
    amount_pattern = re.compile(r"(-?\$?[\d,]+\.\d{2})")

    with open(txt_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            date_match = date_pattern.search(line)
            amount_match = amount_pattern.search(line)

            if not date_match or not amount_match:
                continue

            raw_date = date_match.group(1)
            raw_amount = amount_match.group(1).replace("$", "").replace(",", "")

            # Normalize date to YYYY-MM-DD
            try:
                if "/" in raw_date:
                    parsed_date = datetime.strptime(raw_date, "%m/%d/%Y")
                elif raw_date[2] == "-" and len(raw_date) == 10 and raw_date[5] == "-":
                    parsed_date = datetime.strptime(raw_date, "%d-%m-%Y")
                else:
                    parsed_date = datetime.strptime(raw_date, "%Y-%m-%d")
                date_str = parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                continue

            # Extract description: text between date and amount
            date_end = date_match.end()
            amount_start = amount_match.start()
            description = line[date_end:amount_start].strip(" \t-|")
            if not description:
                description = line

            transactions.append({
                "date": date_str,
                "description": description,
                "amount": raw_amount,
                "source_file": source,
            })

    log.info(f"  Parsed {len(transactions)} transactions from {txt_path.name}")
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
            log.error(f"Could not detect required columns in {csv_path.name}. Found: {headers}")
            return []

        for row in reader:
            normalized_row = {k.lower().strip(): v for k, v in row.items()}

            raw_date = normalized_row.get(date_col, "").strip()
            description = normalized_row.get(desc_col, "").strip()
            raw_amount = normalized_row.get(amount_col, "").strip().replace("$", "").replace(",", "")

            if not raw_date or not description or not raw_amount:
                continue

            # Normalize date
            for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y"):
                try:
                    parsed_date = datetime.strptime(raw_date, fmt)
                    date_str = parsed_date.strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue
            else:
                log.warning(f"Could not parse date: {raw_date} in {csv_path.name}")
                continue

            transactions.append({
                "date": date_str,
                "description": description,
                "amount": raw_amount,
                "source_file": source,
            })

    log.info(f"  Parsed {len(transactions)} transactions from {csv_path.name}")
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

        category, subcategory, needs_review = categorize(norm_desc, merchant)

        txn_id = make_id(t["date"], t["amount"], t["description"])

        enriched.append({
            "id": txn_id,
            "date": t["date"],
            "description": t["description"],
            "normalized_description": norm_desc,
            "amount": t["amount"],
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

    log.info(f"Loaded {len(existing)} existing transactions from output CSV.")
    return existing


def merge(existing: dict[str, dict], new_rows: list[dict]) -> dict[str, dict]:
    """Merge new rows into existing, overwriting on matching id."""
    added = 0
    overwritten = 0
    ts = now_iso()

    for row in new_rows:
        txn_id = row["id"]
        if txn_id in existing:
            row["created_at"] = existing[txn_id]["created_at"]  # preserve original
            row["updated_at"] = ts
            existing[txn_id] = row
            overwritten += 1
        else:
            existing[txn_id] = row
            added += 1

    log.info(f"Merge complete: {added} added, {overwritten} overwritten.")
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

    log.info(f"Output written: {OUTPUT_CSV} ({len(sorted_rows)} rows)")


# ---------------------------------------------------------------------------
# Step 7: Cleanup
# ---------------------------------------------------------------------------

def cleanup(files: list[Path], failed: set[str]):
    """Delete processed input files. Leave failed files in place."""
    for f in files:
        if f.name in failed:
            log.warning(f"Leaving failed file in input/: {f.name}")
            continue
        try:
            f.unlink()
            log.info(f"Deleted: {f.name}")
        except Exception as e:
            log.error(f"Could not delete {f.name}: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    log.info("=" * 60)
    log.info("Statement importer starting")
    log.info("=" * 60)

    # Step 1: Validate input
    pdfs, csvs = get_input_files()
    if not pdfs and not csvs:
        log.error("No statements found in input/. Please add PDF or CSV files and re-run.")
        sys.exit(1)

    log.info(f"Found {len(pdfs)} PDF(s) and {len(csvs)} CSV(s).")

    failed_files: set[str] = set()
    all_input_files: list[Path] = list(pdfs) + list(csvs)

    # Step 2: Convert PDFs
    txt_files = []
    if pdfs:
        txt_files = convert_pdfs(pdfs)
        for pdf in pdfs:
            if pdf.with_suffix(".txt") not in txt_files:
                failed_files.add(pdf.name)
        # Track .txt files for cleanup too
        all_input_files += txt_files

    # Step 3: Parse all statements
    all_transactions = []

    for txt in txt_files:
        try:
            all_transactions += parse_txt(txt)
        except Exception as e:
            log.error(f"Failed to parse {txt.name}: {e}")
            failed_files.add(txt.stem + ".pdf")  # blame the source PDF

    for csv_path in csvs:
        try:
            parsed = parse_csv(csv_path)
            if not parsed:
                failed_files.add(csv_path.name)
            else:
                all_transactions += parsed
        except Exception as e:
            log.error(f"Failed to parse {csv_path.name}: {e}")
            failed_files.add(csv_path.name)

    if not all_transactions:
        log.error("No transactions could be parsed from any statement. Check logs.")
        sys.exit(1)

    log.info(f"Total transactions parsed: {len(all_transactions)}")

    # Step 4: Enrich
    log.info("Enriching transactions (normalization + categorization)...")
    enriched = enrich(all_transactions)

    # Step 5: Merge
    existing = load_existing()
    merged = merge(existing, enriched)

    # Step 6: Write output
    try:
        write_output(merged)
    except Exception as e:
        log.error(f"Failed to write output CSV: {e}")
        log.error("Input files will NOT be deleted.")
        sys.exit(1)

    # Step 7: Cleanup
    cleanup(all_input_files, failed_files)

    needs_review_count = sum(1 for r in merged.values() if r.get("needs_review") == "true")
    log.info("=" * 60)
    log.info(f"Import complete. {needs_review_count} transaction(s) flagged for review.")
    log.info(f"Output: {OUTPUT_CSV}")
    log.info("=" * 60)


if __name__ == "__main__":
    main()
