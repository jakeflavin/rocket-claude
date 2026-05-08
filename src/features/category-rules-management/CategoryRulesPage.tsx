import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Toggle } from '../../shared/components/Toggle';
import { Drawer } from '../../shared/components/Drawer';
import { useRules } from './useRules';
import { useCategories } from '../categories-tags-overview/useCategories';
import { RuleEditorPanel } from './RuleEditorPanel';
import type { Rule, RulePatch } from './types';
import { Button } from '../../shared/components/Button';

function RuleRow({
  rule,
  categoryName,
  onEdit,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  rule: Rule;
  categoryName: string;
  onEdit: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors duration-[100ms] hover:bg-row-hover cursor-pointer ${!rule.enabled ? 'opacity-50' : ''}`}
      onClick={onEdit}
    >
      <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
        <Button variant="icon" size="sm" onClick={onMoveUp} disabled={isFirst}>
          <ChevronUp size={12} />
        </Button>
        <Button variant="icon" size="sm" onClick={onMoveDown} disabled={isLast}>
          <ChevronDown size={12} />
        </Button>
      </div>
      <span className="w-6 shrink-0 text-center text-xs text-muted">{rule.priority}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text truncate">
          <span className="text-muted">{rule.field}</span>{' '}
          <span className="font-medium">{rule.operator.replace('_', ' ')}</span>{' '}
          <span className="font-mono text-xs bg-hover px-1.5 py-0.5 rounded">{rule.value}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-muted">→ {categoryName}</p>
          {rule.is_default && <Badge variant="default">Default</Badge>}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <Toggle checked={rule.enabled} onChange={() => onToggle()} />
      </div>
    </div>
  );
}

export function CategoryRulesPage() {
  const { rules, loading, error, addRule, editRule, removeRule, reorder } = useRules();
  const { categories } = useCategories();
  const [selectedRule, setSelectedRule] = useState<Rule | 'new' | null>(null);
  const [showDefaults, setShowDefaults] = useState(true);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const visibleRules = showDefaults ? rules : rules.filter((r) => !r.is_default);

  async function handleSave(
    id: string | null,
    patch: RulePatch & { value: string; category_id: string; field: Rule['field']; operator: Rule['operator'] },
  ) {
    if (id) {
      await editRule(id, patch);
    } else {
      await addRule(patch.field, patch.operator, patch.value, patch.category_id);
    }
  }

  function handleMoveUp(idx: number) {
    if (idx === 0) return;
    const ids = rules.map((r) => r.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorder(ids);
  }

  function handleMoveDown(idx: number) {
    if (idx === rules.length - 1) return;
    const ids = rules.map((r) => r.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    reorder(ids);
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Categorization Rules</h2>
            {rules.length > 0 && <Badge variant="default">{visibleRules.length}</Badge>}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <span className="text-xs text-muted">Show defaults</span>
              <Toggle checked={showDefaults} onChange={() => setShowDefaults((v) => !v)} />
            </label>
            <Button variant="primary" size="sm" onClick={() => setSelectedRule('new')}>
              <Plus size={12} /> New Rule
            </Button>
          </div>
        </div>
        {loading && (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((n) => <div key={n} className="h-14 animate-pulse rounded-lg bg-hover" />)}
          </div>
        )}
        {error && <p className="p-4 text-sm text-error">{error.message}</p>}
        {!loading && !error && visibleRules.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            {showDefaults
              ? 'No rules yet. Create one to auto-categorize transactions on import.'
              : 'No custom rules yet. Create one or enable "Show defaults" to see built-in rules.'}
          </p>
        )}
        {!loading && !error && visibleRules.length > 0 && (
          <div>
            {visibleRules.map((rule) => {
              const idx = rules.findIndex((r) => r.id === rule.id);
              return (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  categoryName={categoryMap[rule.category_id] ?? rule.category_id}
                  onEdit={() => setSelectedRule(rule)}
                  onToggle={() => editRule(rule.id, { enabled: !rule.enabled })}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  isFirst={idx === 0}
                  isLast={idx === rules.length - 1}
                />
              );
            })}
          </div>
        )}
      </Card>

      <Drawer
        open={selectedRule !== null}
        onClose={() => setSelectedRule(null)}
        title={selectedRule === 'new' ? 'New Rule' : 'Edit Rule'}
      >
        {selectedRule !== null && (
          <RuleEditorPanel
            rule={selectedRule === 'new' ? null : selectedRule}
            categories={categories}
            onClose={() => setSelectedRule(null)}
            onSave={handleSave}
            onDelete={removeRule}
          />
        )}
      </Drawer>
    </>
  );
}
