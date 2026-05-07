import { useState, Fragment, type ReactNode } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Card } from './Card';

export type SortDir = 'asc' | 'desc';

export type ColumnDef<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  sortKey: string;
  sortDir: SortDir;
  onSort: (key: string, dir: SortDir) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  renderExpanded?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  sortKey,
  sortDir,
  onSort,
  loading = false,
  error,
  emptyMessage = 'No results',
  renderExpanded,
  onRowClick,
}: Props<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const totalCols = columns.length + (renderExpanded ? 1 : 0);

  function toggle(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleHeaderClick(key: string) {
    onSort(key, key === sortKey ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc');
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead className="border-b-2 border-border bg-canvas">
            <tr>
              {renderExpanded && <th className="w-9" />}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    'px-4 py-[10px] text-xs font-medium uppercase tracking-[0.04em] text-muted',
                    col.sortable ? 'cursor-pointer select-none hover:text-text' : '',
                    col.headerClassName ?? '',
                  ].join(' ')}
                  onClick={col.sortable ? () => handleHeaderClick(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className={sortKey === col.key ? 'text-brand' : 'text-subtle'}>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ArrowUp size={12} aria-hidden="true" />
                          ) : (
                            <ArrowDown size={12} aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown size={12} aria-hidden="true" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-10 text-center text-sm text-subtle">
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-10 text-center text-sm text-error">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-10 text-center text-sm text-subtle">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = getRowKey(row);
                const expanded = expandedKeys.has(key);
                return (
                  <Fragment key={key}>
                    <tr
                      className={[
                        'border-b border-border',
                        renderExpanded || onRowClick ? 'cursor-pointer' : '',
                        expanded ? 'bg-row-hover' : 'hover:bg-row-hover',
                      ].join(' ')}
                      onClick={
                        onRowClick
                          ? () => onRowClick(row)
                          : renderExpanded
                          ? () => toggle(key)
                          : undefined
                      }
                    >
                      {renderExpanded && (
                        <td className="w-9 px-3 py-3 text-subtle">
                          <span
                            className={`block text-base leading-none transition-transform duration-[150ms] ${expanded ? 'rotate-90' : ''}`}
                          >
                            ›
                          </span>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={['px-4 py-3', col.cellClassName ?? ''].join(' ')}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>

                    {renderExpanded && expanded && (
                      <tr className="border-b border-border bg-canvas">
                        <td colSpan={totalCols} className="px-4 pb-5 pt-3">
                          {renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
