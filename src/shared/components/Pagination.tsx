export type PageSize = 25 | 50 | 100;

const PAGE_SIZES: PageSize[] = [25, 50, 100];

type Props = {
  page: number;
  pageSize: PageSize;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
};

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
      <span>
        {total === 0
          ? 'No results'
          : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`}
      </span>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          Per page
          <select
            className="rounded border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-2 focus:ring-brand/30"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            className="rounded-[6px] px-2 py-1 transition-colors duration-[100ms] hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="min-w-[4rem] text-center text-xs">
            {page} / {totalPages}
          </span>
          <button
            className="rounded-[6px] px-2 py-1 transition-colors duration-[100ms] hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
