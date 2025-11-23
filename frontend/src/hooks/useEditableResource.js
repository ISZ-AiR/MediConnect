import { useEffect, useState, useCallback } from "react";

// Generic hook to manage create/update form logic for a single resource.
// Config options:
// {
//   id,                 // optional id (falsy for create mode)
//   initialValues,      // shape of the form state
//   loadFn,             // async (id) => rawData
//   mapLoad,            // (rawData) => mapped form values
//   createFn,           // async (payload) => result
//   updateFn,           // async (id, payload) => result
//   buildPayload,       // (form) => payload for API
//   onSuccess,          // (result) => void
// }
export const useEditableResource = (config) => {
  const {
    id,
    initialValues,
    loadFn,
    mapLoad,
    createFn,
    updateFn,
    buildPayload,
    onSuccess,
  } = config;

  const [form, setForm] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setField(name, type === "checkbox" ? checked : value);
    },
    [setField]
  );

  // Load existing
  useEffect(() => {
    const load = async () => {
      if (!id || !loadFn) return;
      try {
        setLoading(true);
        setError(null);
        const raw = await loadFn(id);
        const mapped = mapLoad ? mapLoad(raw) : raw;
        setForm((prev) => ({ ...prev, ...mapped }));
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, loadFn, mapLoad]);

  const submit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      try {
        setLoading(true);
        setError(null);
        const payload = buildPayload ? buildPayload(form) : form;
        let result;
        if (id && updateFn) result = await updateFn(id, payload);
        else if (!id && createFn) result = await createFn(payload);
        if (onSuccess) onSuccess(result);
      } catch (err) {
        console.error(err);
        setError("Failed to save data");
      } finally {
        setLoading(false);
      }
    },
    [id, form, buildPayload, createFn, updateFn, onSuccess]
  );

  return { form, setForm, setField, handleChange, submit, loading, error };
};

export default useEditableResource;
