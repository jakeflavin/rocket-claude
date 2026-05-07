import { useEffect, useState } from 'react';
import { queryCategorySpending, querySubcategorySpending } from './queries';
import type { CategorySpending, SubcategorySpending, SpendingPeriod } from './types';

type Result = {
  categorySpending: CategorySpending[];
  subcategorySpending: SubcategorySpending[];
  loading: boolean;
  error: Error | null;
};

export function useCategorySpending(
  period: SpendingPeriod,
  selectedCategoryId: string | null,
): Result {
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [subcategorySpending, setSubcategorySpending] = useState<SubcategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    queryCategorySpending(period)
      .then((data) => {
        if (!cancelled) {
          setCategorySpending(data);
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
  }, [period]);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategorySpending([]);
      return;
    }
    let cancelled = false;
    querySubcategorySpending(selectedCategoryId, period)
      .then((data) => {
        if (!cancelled) setSubcategorySpending(data);
      })
      .catch(() => {
        if (!cancelled) setSubcategorySpending([]);
      });
    return () => { cancelled = true; };
  }, [selectedCategoryId, period]);

  return { categorySpending, subcategorySpending, loading, error };
}
