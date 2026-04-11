#!/usr/bin/env python3
"""
csv_utils.py

Handles all deterministic CSV file operations for the /rocket import pipeline.
No judgment logic — purely mechanical.

Operations:
  1. Concatenate all _normalized.csv files passed as arguments
  2. Deduplicate against existing data/transactions.csv by `id`
     - New id not in existing → append
     - Existing id found → overwrite row, update updated_at, preserve created_at
  3. Sort output by date descending
  4. Write to data/transactions.csv (with header)

Usage:
  python scripts/csv_utils.py <normalized1.csv> [normalized2.csv ...]

Exit codes:
  0 — success
  1 — failure (no input files, write error, etc.)
"""

import csv
import sys
import hashlib
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths (all derived from script location)
# ---------------------------------------------------------------------------
SCRIPTS_DIR = Path(__file__).resolve().parent   # project-root/scripts/
PROJECT_DIR = SCRIPTS_DIR.parent                # project-root/
OUTPUT_CSV  = PROJECT_DIR / "data" / "transactions.csv"

# ---------------------------------------------------------------------------
# Column order — must match .claude/CLAUDE.md exactly
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


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def make_id(date: str, amount: str, description: str) -> str:
    """SHA-256 of raw date + amount + description, hex-encoded."""
    raw = f"{date}{amount}{description}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def load_normalized(path: Path) -> list[dict]:
    """Load a _normalized.csv file produced by the agent pipeline."""
    rows = []
    try:
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(dict(row))
    except Exception as e:
        print(f"ERROR: Could not read {path}: {e}", file=sys.stderr)
    return rows


def load_existing() -> dict[str, dict]:
    """Load existing transactions.csv into a dict keyed by id."""
    if not OUTPUT_CSV.exists():
        return {}

    existing = {}
    try:
        with open(OUTPUT_CSV, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing[row["id"]] = dict(row)
        print(f"Loaded {len(existing)} existing transactions from {OUTPUT_CSV.name}.")
    except Exception as e:
        print(f"ERROR: Could not read existing {OUTPUT_CSV}: {e}", file=sys.stderr)

    return existing


def merge(existing: dict[str, dict], new_rows: list[dict]) -> dict[str, dict]:
    """
    Merge new rows into existing dict.

    - New id → insert as-is
    - Existing id → overwrite all fields except created_at; update updated_at
    """
    added = 0
    overwritten = 0
    ts = now_iso()

    for row in new_rows:
        txn_id = row.get("id", "").strip()
        if not txn_id:
            continue  # skip rows with no id

        # Ensure all columns are present
        full_row = {col: row.get(col, "") for col in COLUMNS}

        if txn_id in existing:
            full_row["created_at"] = existing[txn_id].get("created_at", ts)
            full_row["updated_at"] = ts
            existing[txn_id] = full_row
            overwritten += 1
        else:
            if not full_row.get("created_at"):
                full_row["created_at"] = ts
            if not full_row.get("updated_at"):
                full_row["updated_at"] = ts
            existing[txn_id] = full_row
            added += 1

    print(f"Merge: {added} added, {overwritten} overwritten.")
    return existing


def write_output(rows: dict[str, dict]):
    """Write all rows to output CSV, sorted by date descending."""
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    sorted_rows = sorted(rows.values(), key=lambda r: r.get("date", ""), reverse=True)

    try:
        with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(sorted_rows)
        print(f"Written: {OUTPUT_CSV} ({len(sorted_rows)} total rows)")
    except Exception as e:
        print(f"ERROR: Failed to write {OUTPUT_CSV}: {e}", file=sys.stderr)
        raise


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/csv_utils.py <normalized1.csv> [normalized2.csv ...]")
        sys.exit(1)

    input_paths = [Path(p) for p in sys.argv[1:]]
    missing = [p for p in input_paths if not p.exists()]
    if missing:
        for p in missing:
            print(f"ERROR: File not found: {p}", file=sys.stderr)
        sys.exit(1)

    # Load and concatenate all normalized CSVs
    all_new_rows = []
    for path in input_paths:
        rows = load_normalized(path)
        print(f"Loaded {len(rows)} rows from {path.name}")
        all_new_rows.extend(rows)

    if not all_new_rows:
        print("ERROR: No rows found in any input file.", file=sys.stderr)
        sys.exit(1)

    # Load existing, merge, write
    existing = load_existing()
    merged = merge(existing, all_new_rows)

    try:
        write_output(merged)
    except Exception:
        print("Input files have NOT been deleted.", file=sys.stderr)
        sys.exit(1)

    needs_review_count = sum(
        1 for r in merged.values()
        if str(r.get("needs_review", "")).lower() == "true"
    )
    print(f"Done. {needs_review_count} transaction(s) flagged for review.")


if __name__ == "__main__":
    main()
