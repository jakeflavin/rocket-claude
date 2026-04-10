# Project Overview

## What is rocket-claude?

**rocket-claude** is a browser-based personal finance dashboard that reads a single `transactions.csv` file and renders spending overviews, transaction history, subscription tracking, and bill management — all without a backend, build tool, or package manager.

A companion **Claude Code skill** handles the messy work: ingesting bank PDFs and credit card statements from a watched folder and writing clean, normalized rows into `transactions.csv`. The React UI then reads that file directly and presents the data.

## Goals

- Zero-friction: `npx serve .` and open `http://localhost:3000`
- Claude Code is the data engine; the UI is pure display + interaction
- Dark-first, polished, and fast — light/dark/system theme toggle included
- All financial logic lives in the CSV — the UI never mutates source data (except editable `notes`, `needs_review`, and category overrides)

## Tech Stack

| Layer        | Choice                                    | Why                                |
|--------------|-------------------------------------------|------------------------------------|
| UI Framework | React 18 (via CDN)                        | No build step via Babel standalone |
| Styling      | Tailwind CSS (via CDN)                    | Utility-first, dark/light mode support |
| Components   | Custom UI library (`src/components/ui/`)  | Box/VStack/HStack/Text — thin Tailwind wrappers across 9 files; no external UI framework |
| Icons        | Lucide (vanilla, via CDN)                 | Icon names stored in `settings.json`; rendered via `Icon` primitive wrapping `window.lucide` |
| Charts       | Chart.js (via CDN)                        | UMD bundle auto-registers; `useRef`+`useEffect` lifecycle |
| CSV Parsing  | PapaParse (via CDN)                       | Fast, robust, browser-native       |
| Routing      | No router — tab-based state               | Keeps everything in one HTML file  |
