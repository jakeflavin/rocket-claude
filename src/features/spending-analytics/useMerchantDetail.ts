import { useEffect, useState } from 'react';
import { queryMerchantDetail } from './queries';
import type { MerchantDetail } from './types';

type Result = {
  detail: MerchantDetail | null;
  loading: boolean;
};

export function useMerchantDetail(merchant: string | null): Result {
  const [detail, setDetail] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!merchant) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    queryMerchantDetail(merchant)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [merchant]);

  return { detail, loading };
}
