import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
};

export function Drawer({ open, onClose, title, children, width = 320 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#1A1915]/30 transition-opacity duration-[250ms] ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className={`fixed right-0 top-0 z-50 flex h-full flex-col border-l border-border bg-sidebar shadow-xl transition-transform duration-[250ms] ease-[var(--ease-default)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-[100ms] hover:bg-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </aside>
    </>
  );
}
