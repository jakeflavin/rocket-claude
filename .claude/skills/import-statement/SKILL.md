# import-statement

Import a PDF bank statement into the Rocket finance dashboard. Converts the PDF to markdown, extracts transactions and account info into a staging JSON, enriches it with IDs and categorization rules, then appends to the CSV data files.

## Usage

```
/import-statement [path/to/statement.pdf]
```

If no path is provided, ask the user for the PDF file path before proceeding.

## Steps

Execute these steps in order. Stop and report any error before continuing.

### 1. Validate input

Check that the file exists and has a `.pdf` extension. If not, tell the user and stop.

### 2. Set up temp directory

Create the session temp directory:

```bash
mkdir -p tmp/imports/$(date +%Y%m%d_%H%M%S)
```

Store the timestamp path in a variable (`TS_DIR`) for the rest of the steps.

### 3. Convert PDF to markdown

```bash
markitdown "$PDF_PATH" > "$TS_DIR/statement.md"
```

If markitdown is not found, tell the user to install it: `pip install markitdown`

### 4. Extract raw JSON

```bash
python3 .claude/skills/import-statement/scripts/extract.py "$TS_DIR/statement.md" "$TS_DIR/raw.json"
```

Report the detected bank and parser type from the output. If `needs_review` is true, show the user the detected account name, statement period, and transaction count before continuing.

### 5. Enrich JSON

```bash
python3 .claude/skills/import-statement/scripts/enrich.py "$TS_DIR/raw.json" "$TS_DIR/enriched.json"
```

If the script exits with a non-zero code (e.g. duplicate import detected), report the error and stop — do not run commit.

### 6. Confirm before commit (if needs_review)

If `needs_review` was true in the raw JSON, ask the user to confirm before running commit. Show:
- Account: name @ institution
- Period: start → end
- Transactions: N rows
- Uncategorized: X transactions have no matching rule

### 7. Commit to CSVs

```bash
python3 .claude/skills/import-statement/scripts/commit.py "$TS_DIR/enriched.json"
```

### 8. Report summary

After a successful commit, report:
- ✓ Institution: created or already existed
- ✓ Account: created or updated (show new balance)
- ✓ Transactions: N imported
- ⚠ Uncategorized: list up to 10 transaction descriptions with no category assigned
- Temp files saved to: `$TS_DIR`
