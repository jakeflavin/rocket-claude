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
  python scripts/pdf_to_text.py input/td_march_2025.pdf
"""

import sys
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

MIN_CHARS_THRESHOLD = 100  # If extracted text is shorter than this, treat as failed


def extract_with_pdfplumber(pdf_path: str) -> str:
    """Attempt extraction using pdfplumber (handles tables and layout well)."""
    try:
        import pdfplumber

        pages_text = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                # First try table extraction — better for structured statements
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            if row:
                                cleaned = [cell.strip() if cell else "" for cell in row]
                                pages_text.append("\t".join(cleaned))
                else:
                    # Fall back to raw text for this page
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)

        return "\n".join(pages_text)

    except ImportError:
        log.warning("pdfplumber not installed. Skipping.")
        return ""
    except Exception as e:
        log.warning(f"pdfplumber failed: {e}")
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
        log.error("pypdf not installed. Run: pip install pypdf")
        return ""
    except Exception as e:
        log.error(f"pypdf failed: {e}")
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

    log.info(f"Extracting text from: {pdf_path}")

    # Strategy 1: pdfplumber
    text = extract_with_pdfplumber(pdf_path)
    if len(text.strip()) >= MIN_CHARS_THRESHOLD:
        log.info("Extraction succeeded via pdfplumber.")
        return text

    log.info("pdfplumber output too thin — falling back to pypdf.")

    # Strategy 2: pypdf
    text = extract_with_pypdf(pdf_path)
    if len(text.strip()) >= MIN_CHARS_THRESHOLD:
        log.info("Extraction succeeded via pypdf.")
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
        log.error(str(e))
        sys.exit(1)

    # Write output alongside input file
    output_path = os.path.splitext(pdf_path)[0] + ".txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

    log.info(f"Text written to: {output_path}")
    print(output_path)  # Print output path for piping/scripting


if __name__ == "__main__":
    main()
