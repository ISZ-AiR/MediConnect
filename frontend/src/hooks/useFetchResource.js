import { useEffect, useState, useCallback } from "react";

// Minimal generic fetch hook for list pages.
// Accepts an async fetchFn returning an array; exposes reload and simple state.
export const useFetchResource = (fetchFn) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFn();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
};

export default useFetchResource;
