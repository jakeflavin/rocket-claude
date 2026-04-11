#!/usr/bin/env python3
"""
pdf_to_markdown.py

Converts a bank or credit card statement PDF to a structured markdown file.
Output is written alongside the input file with a .md extension.

Strategy:
  1. Try pdfplumber — extracts tables as markdown pipe tables, preserving column structure
  2. Fall back to pypdf — basic text extraction, wrapped in page-level headings

Goal: preserve document structure (tables, section headers) so Agent 1 can parse
transactions accurately. A structured markdown table is far easier to parse reliably
than a flat text dump.

Usage:
  python scripts/pdf_to_markdown.py <path_to_pdf>

Exit codes:
  0 — success, .md file written
  1 — failure (file not found, unsupported format, extraction below threshold)
"""

import sys
import os
import re

MIN_CHARS_THRESHOLD = 100  # If extracted content is shorter than this, treat as failed


def _table_to_markdown(table: list[list]) -> str:
    """Convert a pdfplumber table (list of rows) to a markdown pipe table."""
    if not table:
        return ""

    rows = []
    for row in table:
        cells = [str(cell).strip() if cell is not None else "" for cell in row]
        rows.append("| " + " | ".join(cells) + " |")

    if not rows:
        return ""

    # Insert a separator after the first row (header)
    header = rows[0]
    col_count = len(table[0]) if table else 0
    separator = "| " + " | ".join(["---"] * col_count) + " |"

    return "\n".join([header, separator] + rows[1:])


def extract_with_pdfplumber(pdf_path: str) -> str:
    """
    Extract PDF content using pdfplumber.

    Tables are converted to markdown pipe tables.
    Non-table pages fall back to text extraction.
    Returns structured markdown string.
    """
    try:
        import pdfplumber

        pages_output = []

        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                page_parts = []

                tables = page.extract_tables()
                if tables:
                    # Extract text above the first table as context
                    text = page.extract_text()
                    if text:
                        # Only include lines that appear before any table-like content
                        for line in text.split("\n"):
                            stripped = line.strip()
                            if stripped and not re.match(r"^\|", stripped):
                                page_parts.append(stripped)

                    for table in tables:
                        md_table = _table_to_markdown(table)
                        if md_table:
                            page_parts.append("")
                            page_parts.append(md_table)
                            page_parts.append("")
                else:
                    text = page.extract_text()
                    if text:
                        page_parts.extend(text.split("\n"))

                if page_parts:
                    pages_output.append(f"## Page {i}\n")
                    pages_output.append("\n".join(page_parts))

        return "\n\n".join(pages_output)

    except ImportError:
        return ""
    except Exception:
        return ""


def extract_with_pypdf(pdf_path: str) -> str:
    """
    Fall back to pypdf for basic text extraction.
    Each page is wrapped in a ## Page N heading.
    """
    try:
        from pypdf import PdfReader

        reader = PdfReader(pdf_path)
        pages_output = []

        for i, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages_output.append(f"## Page {i}\n")
                pages_output.append(text.strip())

        return "\n\n".join(pages_output)

    except ImportError:
        print("ERROR: pypdf not installed. Run: pip install pypdf", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"ERROR: pypdf failed: {e}", file=sys.stderr)
        return ""


def pdf_to_markdown(pdf_path: str) -> str:
    """
    Convert a PDF to structured markdown using the best available strategy.
    Returns the markdown string, or raises RuntimeError on failure.
    """
    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"File not found: {pdf_path}")

    if not pdf_path.lower().endswith(".pdf"):
        raise ValueError(f"Expected a .pdf file, got: {pdf_path}")

    # Strategy 1: pdfplumber (preserves tables)
    content = extract_with_pdfplumber(pdf_path)
    if len(content.strip()) >= MIN_CHARS_THRESHOLD:
        return content

    # Strategy 2: pypdf (plain text fallback)
    content = extract_with_pypdf(pdf_path)
    if len(content.strip()) >= MIN_CHARS_THRESHOLD:
        return content

    raise RuntimeError(
        f"Could not extract meaningful content from {pdf_path}. "
        "The PDF may be scanned/image-based and require OCR."
    )


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/pdf_to_markdown.py <path_to_pdf>")
        sys.exit(1)

    pdf_path = sys.argv[1]

    try:
        content = pdf_to_markdown(pdf_path)
    except (FileNotFoundError, ValueError, RuntimeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    output_path = os.path.splitext(pdf_path)[0] + ".md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(output_path)


if __name__ == "__main__":
    main()
