import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Select } from './Select';

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
    <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-muted">
      <span>
        {total === 0
          ? 'No results'
          : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`}
      </span>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          Per page
          <Select
            className="h-7 px-2 text-xs"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            variant="icon"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </Button>
          <span className="min-w-[4rem] text-center text-xs">
            {page} / {totalPages}
          </span>
          <Button
            variant="icon"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
