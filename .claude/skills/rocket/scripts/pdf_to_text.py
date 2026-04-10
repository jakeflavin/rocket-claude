#!/usr/bin/env python3
"""
pdf_to_text.py

Converts a bank or credit card statement PDF to a plain text file.
Output is written alongside the input file with a .txt extension.

Strategy:
  1. Try pdfplumber (best for tabular statement layouts)
  2. Fall back to pypdf if pdfplumber yields empty/thin output

Usage:
  python scripts/pdf_to_text.py <path_to_pdf>
"""

import sys
import os

MIN_CHARS_THRESHOLD = 100  # If extracted text is shorter than this, treat as failed


def extract_with_pdfplumber(pdf_path: str) -> str:
    """Attempt extraction using pdfplumber (handles tables and layout well)."""
    try:
        import pdfplumber

        pages_text = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            if row:
                                cleaned = [cell.strip() if cell else "" for cell in row]
                                pages_text.append("\t".join(cleaned))
                else:
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)

        return "\n".join(pages_text)

    except ImportError:
        return ""
    except Exception:
        return ""


def extract_with_pypdf(pdf_path: str) -> str:
    """Fall back to pypdf for basic text extraction."""
    try:
        from pypdf import PdfReader

        reader = PdfReader(pdf_path)
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)

        return "\n".join(pages_text)

    except ImportError:
        print("ERROR: pypdf not installed. Run: pip install pypdf", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"ERROR: pypdf failed: {e}", file=sys.stderr)
        return ""


def pdf_to_text(pdf_path: str) -> str:
    """
    Convert a PDF to text using the best available strategy.
    Returns the extracted text string, or raises RuntimeError on failure.
    """
    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"File not found: {pdf_path}")

    if not pdf_path.lower().endswith(".pdf"):
        raise ValueError(f"Expected a .pdf file, got: {pdf_path}")

    # Strategy 1: pdfplumber
    text = extract_with_pdfplumber(pdf_path)
    if len(text.strip()) >= MIN_CHARS_THRESHOLD:
        return text

    # Strategy 2: pypdf
    text = extract_with_pypdf(pdf_path)
    if len(text.strip()) >= MIN_CHARS_THRESHOLD:
        return text

    raise RuntimeError(
        f"Could not extract meaningful text from {pdf_path}. "
        "The PDF may be scanned/image-based and require OCR."
    )


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/pdf_to_text.py <path_to_pdf>")
        sys.exit(1)

    pdf_path = sys.argv[1]

    try:
        text = pdf_to_text(pdf_path)
    except (FileNotFoundError, ValueError, RuntimeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    output_path = os.path.splitext(pdf_path)[0] + ".txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(output_path)


if __name__ == "__main__":
    main()
