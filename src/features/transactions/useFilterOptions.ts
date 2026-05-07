import { useEffect, useState } from 'react';
import { queryFilterOptions } from './queries';
import type { FilterOption } from './types';

export type { FilterOption };

type FilterOptions = {
  accounts: FilterOption[];
  categories: FilterOption[];
};

export function useFilterOptions(): FilterOptions {
  const [accounts, setAccounts] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);

  useEffect(() => {
    queryFilterOptions()
      .then(({ accounts, categories }) => {
        setAccounts(accounts);
        setCategories(categories);
      })
      .catch(() => {
        // non-critical; dropdowns stay empty
      });
  }, []);

  return { accounts, categories };
}
