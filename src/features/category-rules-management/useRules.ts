import { useCallback, useEffect, useState } from 'react';
import { queryRules, createRule, updateRule, deleteRule, reorderRules } from './queries';
import type { Rule, RulePatch } from './types';

type Result = {
  rules: Rule[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  addRule: (
    field: Rule['field'],
    operator: Rule['operator'],
    value: string,
    categoryId: string,
    applyTag: string | null,
  ) => Promise<string>;
  editRule: (id: string, patch: RulePatch) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
};

export function useRules(): Result {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rev, setRev] = useState(0);

  function refresh() {
    setRev((r) => r + 1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryRules()
      .then((data) => {
        if (!cancelled) {
          setRules(data);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [rev]);

  const addRule = useCallback(
    async (
      field: Rule['field'],
      operator: Rule['operator'],
      value: string,
      categoryId: string,
      applyTag: string | null,
    ) => {
      const id = await createRule(field, operator, value, categoryId, applyTag);
      refresh();
      return id;
    },
    [],
  );

  const editRule = useCallback(async (id: string, patch: RulePatch) => {
    await updateRule(id, patch);
    refresh();
  }, []);

  const removeRule = useCallback(async (id: string) => {
    await deleteRule(id);
    refresh();
  }, []);

  const reorder = useCallback(async (orderedIds: string[]) => {
    await reorderRules(orderedIds);
    refresh();
  }, []);

  return { rules, loading, error, refresh, addRule, editRule, removeRule, reorder };
}
