import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "melodix_";

export default function useLocalStorage(key, initialValue) {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${storageKey}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${storageKey}":`, error);
    }
  }, [storageKey, storedValue]);

  // Wrapper for setValue to handle function updates
  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      return valueToStore;
    });
  }, []);

  // Clear this specific key
  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${storageKey}":`, error);
    }
  }, [storageKey, initialValue]);

  return [storedValue, setValue, clearValue];
}

// Utility to clear all Melodix data
export const clearAllMelodixData = () => {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.error("Error clearing Melodix data:", error);
  }
};
