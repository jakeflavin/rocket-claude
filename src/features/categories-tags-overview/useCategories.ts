import { useCallback, useEffect, useState } from 'react';
import {
  queryCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './queries';
import type { Category } from './types';

type Result = {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  addCategory: (name: string, color: string, parentId: string | null, icon?: string) => Promise<string>;
  editCategory: (id: string, patch: Partial<{ name: string; color: string; icon: string | null }>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
};

export function useCategories(): Result {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rev, setRev] = useState(0);

  function refresh() {
    setRev((r) => r + 1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
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

  const addCategory = useCallback(
    async (name: string, color: string, parentId: string | null, icon?: string) => {
      const id = await createCategory(name, color, parentId, icon);
      refresh();
      return id;
    },
    [],
  );

  const editCategory = useCallback(
    async (id: string, patch: Partial<{ name: string; color: string; icon: string | null }>) => {
      await updateCategory(id, patch);
      refresh();
    },
    [],
  );

  const removeCategory = useCallback(async (id: string) => {
    await deleteCategory(id);
    refresh();
  }, []);

  return { categories, loading, error, refresh, addCategory, editCategory, removeCategory };
}
