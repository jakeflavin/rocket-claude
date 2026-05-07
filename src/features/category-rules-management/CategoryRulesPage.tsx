import { useState } from 'react';
import { Plus, GripVertical, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { useRules } from './useRules';
import { useCategories } from '../categories-tags-overview/useCategories';
import { useTags } from '../categories-tags-overview/useTags';
import { RuleEditorPanel } from './RuleEditorPanel';
import type { Rule, RulePatch } from './types';

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
  const ToggleIcon = rule.enabled ? ToggleRight : ToggleLeft;
  return (
    <div className={`group flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors duration-[100ms] hover:bg-row-hover ${!rule.enabled ? 'opacity-50' : ''}`}>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="text-subtle hover:text-text disabled:opacity-30 leading-none"
          title="Move up"
        >▴</button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="text-subtle hover:text-text disabled:opacity-30 leading-none"
          title="Move down"
        >▾</button>
      </div>
      <span className="w-6 shrink-0 text-center text-xs text-muted">{rule.priority}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text truncate">
          <span className="text-muted">{rule.field}</span>{' '}
          <span className="font-medium">{rule.operator.replace('_', ' ')}</span>{' '}
          <span className="font-mono text-xs bg-hover px-1.5 py-0.5 rounded">{rule.value}</span>
        </p>
        <p className="text-xs text-muted mt-0.5">→ {categoryName}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`shrink-0 ${rule.enabled ? 'text-brand' : 'text-muted'} hover:opacity-80 transition-opacity`}
        title={rule.enabled ? 'Disable rule' : 'Enable rule'}
      >
        <ToggleIcon size={20} />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="hidden group-hover:flex shrink-0 items-center justify-center w-7 h-7 rounded text-muted hover:bg-hover hover:text-text"
      >
        <Pencil size={13} />
      </button>
    </div>
  );
}

export function CategoryRulesPage() {
  const { rules, loading, error, addRule, editRule, removeRule, reorder } = useRules();
  const { categories } = useCategories();
  const { tags } = useTags();
  const [selectedRule, setSelectedRule] = useState<Rule | 'new' | null>(null);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  async function handleSave(
    id: string | null,
    patch: RulePatch & { value: string; category_id: string; field: Rule['field']; operator: Rule['operator'] },
  ) {
    if (id) {
      await editRule(id, patch);
    } else {
      await addRule(patch.field, patch.operator, patch.value, patch.category_id, patch.apply_tag ?? null);
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
    <div className="flex min-h-0 gap-6">
      <div className="flex-1 min-w-0">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text">Categorization Rules</h2>
              {rules.length > 0 && <Badge variant="default">{rules.length}</Badge>}
            </div>
            <button
              type="button"
              onClick={() => setSelectedRule('new')}
              className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover transition-colors duration-[100ms]"
            >
              <Plus size={12} /> New Rule
            </button>
          </div>
          {loading && (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((n) => <div key={n} className="h-14 animate-pulse rounded-lg bg-hover" />)}
            </div>
          )}
          {error && <p className="p-4 text-sm text-error">{error.message}</p>}
          {!loading && !error && rules.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">No rules yet. Create one to auto-categorize transactions on import.</p>
          )}
          {!loading && !error && rules.length > 0 && (
            <div>
              {rules.map((rule, idx) => (
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
              ))}
            </div>
          )}
        </Card>
      </div>

      {selectedRule !== null && (
        <div className="w-[320px] shrink-0">
          <RuleEditorPanel
            rule={selectedRule === 'new' ? null : selectedRule}
            categories={categories}
            tags={tags}
            onClose={() => setSelectedRule(null)}
            onSave={handleSave}
            onDelete={removeRule}
          />
        </div>
      )}
    </div>
  );
}
