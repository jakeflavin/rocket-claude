import { useEffect, useState } from 'react';
import { querySettings, updateSetting } from './queries';
import type { AppearanceMode } from './types';

function applyTheme(mode: AppearanceMode) {
  const root = document.documentElement;
  if (mode === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', mode);
  }
}

type Result = {
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;
  loading: boolean;
};

export function useSettings(): Result {
  const [appearance, setAppearanceState] = useState<AppearanceMode>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    querySettings().then((settings) => {
      setAppearanceState(settings.appearance);
      applyTheme(settings.appearance);
      setLoading(false);
    });
  }, []);

  function setAppearance(mode: AppearanceMode) {
    setAppearanceState(mode);
    applyTheme(mode);
    updateSetting('appearance', mode);
  }

  return { appearance, setAppearance, loading };
}
