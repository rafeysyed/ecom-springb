import { useState, useEffect, useCallback } from 'react';

/**
 * Generic localStorage-backed state, similar in spirit to useState but
 * persisted. The auth and cart stores already handle their own persistence
 * via zustand/persist — this hook is for smaller, one-off persisted values
 * that don't warrant a dedicated store (e.g. "recently viewed products",
 * a dismissed banner flag, a saved filter preference).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage may be full or unavailable (private browsing) — fail silently,
            // the in-memory state still works for the current session.
        }
    }, [key, value]);

    const remove = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
        } catch {
            // ignore
        }
        setValue(initialValue);
    }, [key, initialValue]);

    return [value, setValue, remove] as const;
}