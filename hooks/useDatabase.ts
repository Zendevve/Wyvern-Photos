// React hook for database operations
import { useState, useEffect, useCallback } from 'react';
import { initDatabase, closeDatabase } from '../lib/database';
import { getSettings, updateSettings } from '../lib/database/dao';
import type { Settings } from '../lib/database/schema';

export interface UseDatabaseResult {
  isReady: boolean;
  error: string | null;
  settings: Settings | null;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export function useDatabase(): UseDatabaseResult {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
        setIsReady(true);
      } catch (err) {
        console.error('[useDatabase] Init failed:', err);
        setError(err instanceof Error ? err.message : 'Database init failed');
      }
    })();

    return () => {
      closeDatabase();
    };
  }, []);

  const handleUpdateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      await updateSettings(updates);
      const refreshed = await getSettings();
      setSettings(refreshed);
    } catch (err) {
      console.error('[useDatabase] Update settings failed:', err);
      throw err;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const refreshed = await getSettings();
      setSettings(refreshed);
    } catch (err) {
      console.error('[useDatabase] Refresh settings failed:', err);
    }
  }, []);

  return {
    isReady,
    error,
    settings,
    updateSettings: handleUpdateSettings,
    refreshSettings,
  };
}
