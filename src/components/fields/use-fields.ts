import { useCallback, useMemo, useRef, useState } from "react";
import { FieldValue, FieldValues } from "./types";

export type UseFieldsResult = {
  values: FieldValues;
  value: FieldValues;
  setField: (key: string, value: FieldValue) => void;
  clearField: (key: string) => void;
  setValues: (updates: FieldValues) => void;
  reset: (next?: FieldValues) => void;
  hasChanged: boolean;
};

/**
 * Lightweight state holder for config-driven fields.
 * `setValues`/`reset` shallow-merge and rely on referential identity so the
 * returned `values` object changes on every update.
 */
export function useFields(initial?: FieldValues): UseFieldsResult {
  const [values, setValues] = useState<FieldValues>(initial ?? {});
  const baselineRef = useRef<FieldValues>(initial ?? {});

  const setField = useCallback((key: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearField = useCallback((key: string) => {
    setValues((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const merge = useCallback((updates: FieldValues) => {
    setValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback((next?: FieldValues) => {
    setValues(next ?? baselineRef.current);
  }, []);

  const hasChanged = useMemo(() => {
    const baseline = baselineRef.current;
    const keys = new Set([...Object.keys(baseline), ...Object.keys(values)]);
    for (const key of keys) {
      if (baseline[key] !== values[key]) return true;
    }
    return false;
  }, [values]);

  return {
    values,
    value: values,
    setField,
    clearField,
    setValues: merge,
    reset,
    hasChanged,
  };
}

export default useFields;