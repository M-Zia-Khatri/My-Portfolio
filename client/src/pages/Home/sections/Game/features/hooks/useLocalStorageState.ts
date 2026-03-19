// @/hooks/useLocalStorageHistory.ts
import { useCallback, useEffect, useState } from "react";

export default function useLocalStorageHistory<T>(
  key: string = "guess-number-history"
) {
  const [history, setHistory] = useState<T[]>([]);

  // Load from localStorage
  const load = useCallback(() => {
    try {
      const json = localStorage.getItem(key);
      setHistory(json ? (JSON.parse(json) as T[]) : []);
    } catch {
      setHistory([]);
    }
  }, [key]);

  // On mount (or if key changes), load once
  useEffect(() => {
    load();
  }, [load]);

  // Save one record (functional update)
  const save = useCallback(
    (record: T) => {
      setHistory((prev) => {
        const updated = [...prev, record];
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {
          /* ignore write errors */
        }
        return updated;
      });
    },
    [key]
  );

  // Clear all history
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore remove errors */
    }
    setHistory([]);
  }, [key]);

  // Public API
  return {
    history,
    saveHistory: save,
    clearHistory: clear,
    reloadHistory: load,
  };
}
