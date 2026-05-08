import { Monitor, Moon, Sun } from 'lucide-react';
import { Drawer } from '../../shared/components/Drawer';
import type { AppearanceMode } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  appearance: AppearanceMode;
  onSetAppearance: (mode: AppearanceMode) => void;
};

type Option = {
  value: AppearanceMode;
  icon: typeof Moon;
  label: string;
  description: string;
};

const OPTIONS: Option[] = [
  { value: 'dark', icon: Moon, label: 'Dark', description: 'Always use dark theme' },
  { value: 'light', icon: Sun, label: 'Light', description: 'Always use light theme' },
  { value: 'system', icon: Monitor, label: 'System', description: 'Match your OS preference' },
];

export function SettingsDrawer({ open, onClose, appearance, onSetAppearance }: Props) {
  return (
    <Drawer open={open} onClose={onClose} title="Settings">
      <div className="p-4 space-y-5">
        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">Appearance</p>
          <div className="space-y-2">
            {OPTIONS.map(({ value, icon: Icon, label, description }) => {
              const selected = appearance === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSetAppearance(value)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-[100ms] ${
                    selected
                      ? 'border-brand bg-brand/[0.06]'
                      : 'border-border hover:bg-hover'
                  }`}
                >
                  <Icon size={16} className={selected ? 'text-brand' : 'text-muted'} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${selected ? 'text-brand' : 'text-text'}`}>{label}</p>
                    <p className="text-xs text-muted">{description}</p>
                  </div>
                  {selected && (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
