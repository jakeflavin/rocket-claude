/**
 * CsvParser — PapaParse wrapper for transactions.csv.
 *
 * Handles loading, row validation, and normalization so the
 * useTransactions hook receives a clean, typed array every time.
 *
 * Exposed on window.CsvParser.
 */
window.CsvParser = {

  /** Required fields — rows missing any of these are dropped. */
  REQUIRED_FIELDS: [
    'id', 'date', 'amount', 'description',
    'normalized_description', 'merchant', 'category',
    'account', 'account_type', 'source_file',
  ],

  /**
   * Returns true if the row has all required fields with non-empty values.
   * @param {Object} row
   * @returns {boolean}
   */
  isValid(row) {
    if (!row || typeof row !== 'object') return false;
    return window.CsvParser.REQUIRED_FIELDS.every(field => {
      const val = row[field];
      return val !== undefined && val !== null && String(val).trim() !== '';
    });
  },

  /**
   * Normalize a raw PapaParse row into a consistent shape:
   * - amount → number
   * - needs_review → boolean
   * - notes / subcategory → string (never null)
   *
   * @param {Object} row
   * @returns {Object}
   */
  normalize(row) {
    return {
      ...row,
      amount:       Number(row.amount),
      needs_review: String(row.needs_review).trim().toLowerCase() === 'true',
      notes:        row.notes        != null ? String(row.notes)        : '',
      subcategory:  row.subcategory  != null ? String(row.subcategory)  : '',
    };
  },

  /**
   * Parse a CSV file and return validated, normalized transaction rows.
   *
   * @param {string}   path       - URL/path to the CSV file
   * @param {function} onComplete - Called with an array of clean rows
   * @param {function} onError    - Called with an error message string
   */
  parse(path, onComplete, onError) {
    Papa.parse(path, {
      download:     true,
      header:       true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete({ data, errors }) {
        if (errors.length > 0) {
          const critical = errors.filter(e => e.type === 'Delimiter' || e.type === 'Quotes');
          if (critical.length > 0) {
            onError(`CSV parse error: ${critical[0].message}`);
            return;
          }
        }

        const valid = data
          .filter(row => window.CsvParser.isValid(row))
          .map(row  => window.CsvParser.normalize(row));

        const dropped = data.length - valid.length;
        if (dropped > 0) {
          console.warn(`[CsvParser] Dropped ${dropped} malformed row(s) from ${path}`);
        }

        onComplete(valid);
      },
      error(err) {
        onError(err.message || 'Failed to load transactions.csv');
      },
    });
  },
};
