import { ChevronRight, ListFilter, Monitor, Moon, Sun } from 'lucide-react';
import { Drawer } from '../../shared/components/Drawer';
import type { AppearanceMode } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  appearance: AppearanceMode;
  onSetAppearance: (mode: AppearanceMode) => void;
  onNavigate: (path: string) => void;
};

type AppearanceOption = {
  value: AppearanceMode;
  icon: typeof Moon;
  label: string;
  description: string;
};

const APPEARANCE_OPTIONS: AppearanceOption[] = [
  { value: 'dark', icon: Moon, label: 'Dark', description: 'Always use dark theme' },
  { value: 'light', icon: Sun, label: 'Light', description: 'Always use light theme' },
  { value: 'system', icon: Monitor, label: 'System', description: 'Match your OS preference' },
];

export function SettingsDrawer({ open, onClose, appearance, onSetAppearance, onNavigate }: Props) {
  function navigateTo(path: string) {
    onClose();
    onNavigate(path);
  }

  return (
    <Drawer open={open} onClose={onClose} title="Settings">
      <div className="p-4 space-y-6">

        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">Appearance</p>
          <div className="space-y-2">
            {APPEARANCE_OPTIONS.map(({ value, icon: Icon, label, description }) => {
              const selected = appearance === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSetAppearance(value)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-[100ms] ${
                    selected ? 'border-brand bg-brand/[0.06]' : 'border-border hover:bg-hover'
                  }`}
                >
                  <Icon size={16} className={selected ? 'text-brand' : 'text-muted'} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${selected ? 'text-brand' : 'text-text'}`}>{label}</p>
                    <p className="text-xs text-muted">{description}</p>
                  </div>
                  {selected && <div className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">Categories</p>
          <button
            type="button"
            onClick={() => navigateTo('/settings/categories/rules')}
            className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors duration-[100ms] hover:bg-hover"
          >
            <ListFilter size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">Category Rules</p>
              <p className="text-xs text-muted">Auto-categorize transactions on import</p>
            </div>
            <ChevronRight size={14} className="shrink-0 text-subtle" aria-hidden="true" />
          </button>
        </div>

      </div>
    </Drawer>
  );
}
