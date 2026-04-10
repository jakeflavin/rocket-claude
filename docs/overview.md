# Project Overview

## What is rocket-claude?

**rocket-claude** is a browser-based personal finance dashboard that reads a single `transactions.csv` file and renders spending overviews, transaction history, subscription tracking, and bill management — all without a backend, build tool, or package manager.

A companion **Claude Code skill** handles the messy work: ingesting bank PDFs and credit card statements from a watched folder and writing clean, normalized rows into `transactions.csv`. The React UI then reads that file directly and presents the data.

## Goals

- Zero-friction: double-click `index.html` to launch
- Claude Code is the data engine; the UI is pure display + interaction
- Dark-first, polished, and fast
- All financial logic lives in the CSV — the UI never mutates source data (except editable `notes` and `needs_review` fields written back to the CSV)

## Tech Stack

| Layer        | Choice                               | Why                                |
|--------------|--------------------------------------|------------------------------------|
| UI Framework | React 18 (via CDN)                   | No build step via Babel standalone |
| Styling      | Tailwind CSS (via CDN)               | Utility-first, dark mode support   |
| Components   | Gluestack UI (via CDN)               | Accessible, themeable primitives   |
| Charts       | Chart.js + react-chartjs-2 (via CDN) | Flexible, dark-theme friendly      |
| CSV Parsing  | PapaParse (via CDN)                  | Fast, robust, browser-native       |
| Routing      | No router — tab-based state          | Keeps everything in one HTML file  |
