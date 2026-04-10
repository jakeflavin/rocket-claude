# rocket-claude

A Claude Code–powered personal finance dashboard. No build step. No compile.

React 18 + Tailwind CSS + Chart.js + PapaParse, all via CDN. Drop bank statements into `statements/`, run the import skill, open the dashboard.

---

## Quick Start

### 1. Serve the dashboard

The app must be served over HTTP — opening `index.html` directly via `file://` will fail due to browser CORS restrictions.

```bash
npx serve .
```

Then open the URL printed by `serve` (typically `http://localhost:3000`).

### 2. Import bank statements

Drop PDF or CSV statement files into the `statements/` folder, then run the Claude Code import skill:

```
/rocket
```

The skill will extract transactions, categorize them, deduplicate against existing data, write to `data/transactions.csv`, and open the dashboard automatically.

### 3. Review flagged transactions

Any transactions the importer couldn't categorize confidently are marked `needs_review: true`. The dashboard surfaces these in an amber banner — click "Review now" to filter to them in the Transactions page.

---

## Requirements

- Node.js (for `npx serve`)
- Python 3 + `pip install pdfplumber pypdf anthropic pandas` (for the import skill)
- An Anthropic API key set as `ANTHROPIC_API_KEY` in your environment (for AI categorization fallback)
