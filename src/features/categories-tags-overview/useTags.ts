import { useCallback, useEffect, useState } from 'react';
import { queryTags, createTag, updateTag, deleteTag } from './queries';
import type { Tag } from './types';

type Result = {
  tags: Tag[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  addTag: (name: string, color: string) => Promise<string>;
  editTag: (id: string, patch: Partial<{ name: string; color: string }>) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
};

export function useTags(): Result {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rev, setRev] = useState(0);

  function refresh() {
    setRev((r) => r + 1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryTags()
      .then((data) => {
        if (!cancelled) {
          setTags(data);
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

  const addTag = useCallback(async (name: string, color: string) => {
    const id = await createTag(name, color);
    refresh();
    return id;
  }, []);

  const editTag = useCallback(
    async (id: string, patch: Partial<{ name: string; color: string }>) => {
      await updateTag(id, patch);
      refresh();
    },
    [],
  );

  const removeTag = useCallback(async (id: string) => {
    await deleteTag(id);
    refresh();
  }, []);

  return { tags, loading, error, refresh, addTag, editTag, removeTag };
}
