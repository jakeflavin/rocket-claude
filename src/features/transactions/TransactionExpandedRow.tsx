import { type ReactNode } from 'react';
import type { Transaction } from './types';

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-full' : ''}>
      <dt className="text-xs font-medium uppercase tracking-[0.04em] text-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm text-text">{children}</dd>
    </div>
  );
}

const Dash = () => <span className="text-subtle">—</span>;

export function TransactionExpandedRow({ row }: { row: Transaction }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-4 pt-1 sm:grid-cols-3 lg:grid-cols-4">
      <Field label="Description">{row.description ?? <Dash />}</Field>

      <Field label="Type">
        {row.transaction_type ? (
          <span className="capitalize">{row.transaction_type}</span>
        ) : (
          <Dash />
        )}
      </Field>

      <Field label="Authorized Date">
        {row.authorized_date ? formatDate(row.authorized_date) : <Dash />}
      </Field>

      <Field label="Transfer">
        {row.is_transfer ? (
          <span className="inline-flex items-center rounded-full border border-info-border bg-info-bg px-2 py-0.5 text-xs font-medium text-info">
            Yes
          </span>
        ) : (
          <span className="text-subtle">No</span>
        )}
      </Field>

      <Field label="Transfer Group">{row.transfer_group ?? <Dash />}</Field>

      <Field label="External ID">
        {row.external_id ? (
          <span className="font-mono text-xs">{row.external_id}</span>
        ) : (
          <Dash />
        )}
      </Field>

      <Field label="Location">{row.location ?? <Dash />}</Field>

      <Field label="Tags">{row.tags ?? <Dash />}</Field>

      {row.notes && (
        <Field label="Notes" wide>
          {row.notes}
        </Field>
      )}

      <Field label="Imported">
        {row.created_at ? formatDateTime(row.created_at) : <Dash />}
      </Field>
    </dl>
  );
}
