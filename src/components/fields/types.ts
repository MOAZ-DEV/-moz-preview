import type { ReactNode } from "react";

export type FieldValue = string | number | boolean | null | undefined;
export type FieldValues = Record<string, FieldValue>;

export type FieldOption = {
  label: string;
  value: string;
  disabled?: boolean;
};
export type FieldOptionSource = FieldOption[] | readonly string[];

export type BaseFieldConfig = {
  key: string;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  defaultValue?: FieldValue;
  className?: string;
};

export type TextFieldConfig = BaseFieldConfig & {
  type: "text" | "email" | "url" | "password" | "search";
  autoComplete?: string;
};

export type TextareaFieldConfig = BaseFieldConfig & {
  type: "textarea";
  rows?: number;
  autoResize?: boolean;
};

export type NumberFieldConfig = BaseFieldConfig & {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
};

export type RangeFieldConfig = BaseFieldConfig & {
  type: "range";
  min: number;
  max: number;
  step?: number;
};

export type SelectFieldConfig = BaseFieldConfig & {
  type: "select";
  options: FieldOptionSource;
  placeholder?: string;
};

export type ToggleFieldConfig = BaseFieldConfig & {
  type: "toggle";
};

export type RadioFieldConfig = BaseFieldConfig & {
  type: "radio";
  options: FieldOptionSource;
};

export type ColorFieldConfig = BaseFieldConfig & {
  type: "color";
};

export type GroupFieldConfig = {
  type: "group";
  key?: string;
  label?: ReactNode;
  description?: ReactNode;
  columns?: 1 | 2;
  collapsible?: boolean;
  className?: string;
  fields: FieldConfig[];
};

export type FieldConfig =
  | TextFieldConfig
  | TextareaFieldConfig
  | NumberFieldConfig
  | RangeFieldConfig
  | SelectFieldConfig
  | ToggleFieldConfig
  | RadioFieldConfig
  | ColorFieldConfig
  | GroupFieldConfig;

export function normalizeOptions(options: FieldOptionSource): FieldOption[] {
  return options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
}

export function defaultValueFor(field: FieldConfig): FieldValue {
  if (field.type === "group") return undefined;
  if (field.type === "toggle") return field.defaultValue ?? false;
  if (field.type === "select" || field.type === "radio") {
    if (field.defaultValue !== undefined) return field.defaultValue;
    return normalizeOptions(field.options)[0]?.value ?? "";
  }
  return field.defaultValue ?? undefined;
}

export function collectDefaults(fields: FieldConfig[]): FieldValues {
  const values: FieldValues = {};
  const visit = (list: FieldConfig[]) => {
    for (const field of list) {
      if (field.type === "group") {
        visit(field.fields);
        continue;
      }
      const value = defaultValueFor(field);
      if (field.defaultValue !== undefined || field.type === "toggle") {
        values[field.key] = value;
      }
    }
  };
  visit(fields);
  return values;
}