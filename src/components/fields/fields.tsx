import { useMemo, useRef, useState } from "react";
import { cn } from "../../lib";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Switch } from "../ui/switch";
import { Segmented } from "../ui/segmented";
import { Badge } from "../ui/badge";
import { collectDefaults, defaultValueFor } from "./types";
import {
  FieldConfig,
  FieldOption,
  FieldValue,
  FieldValues,
  normalizeOptions,
} from "./types";
import { useFields } from "./use-fields";

export type FieldsProps = {
  fields: FieldConfig[];
  /** Controlled values. When omitted, the component manages state internally. */
  values?: FieldValues;
  onChange?: (values: FieldValues, fieldKey: string, value: FieldValue) => void;
  disabled?: boolean;
  /** Column count for the root grid. */
  columns?: 1 | 2;
  className?: string;
};

const controlBase =
  "h-7 w-full rounded-sm border border-input bg-surface px-2 text-xs text-foreground " +
  "placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const labelClass =
  "flex items-center gap-1 text-[11px] font-medium text-muted-foreground";

const hintClass = "text-[11px] leading-snug text-muted-foreground/80";

function FieldShell({
  label,
  id,
  required,
  description,
  disabled,
  className,
  children,
}: {
  label?: React.ReactNode;
  id?: string;
  required?: boolean;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span className={labelClass}>
          <label htmlFor={id} className={cn(disabled && "opacity-50")}>
            {label}
          </label>
          {required && <span className="text-destructive">*</span>}
        </span>
      )}
      {children}
      {description && <p className={hintClass}>{description}</p>}
    </div>
  );
}

function RangeReadout({ defaultValue, suffix }: { defaultValue?: string; suffix?: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-xs border border-border bg-surface px-1.5 font-mono text-[10px] text-foreground">
      {defaultValue ?? "—"}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}

function TextareaControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "textarea" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    setHeight(el.scrollHeight);
  };

  return (
    <FieldShell
      id={field.key}
      label={field.label}
      required={field.required}
      description={field.description}
      disabled={disabled}
      className={field.className}
    >
      <textarea
        ref={ref}
        id={field.key}
        rows={field.rows ?? 3}
        value={String(value ?? "")}
        disabled={disabled || field.disabled}
        placeholder={field.placeholder}
        style={field.autoResize && height ? { height } : undefined}
        onInput={field.autoResize ? autoResize : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "resize-y rounded-sm border border-input bg-surface px-2 py-1.5 text-xs text-foreground",
          "placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
    </FieldShell>
  );
}

function NumberControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "number" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const numeric = typeof value === "number" || value === "" ? value : Number(value);
  return (
    <FieldShell
      id={field.key}
      label={field.label}
      required={field.required}
      description={field.description}
      disabled={disabled}
      className={field.className}
    >
      <span className="relative flex items-center">
        <input
          id={field.key}
          type="number"
          value={numeric === undefined || Number.isNaN(numeric as number) ? "" : String(numeric)}
          min={field.min}
          max={field.max}
          step={field.step}
          disabled={disabled || field.disabled}
          placeholder={field.placeholder}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const parsed = Number(raw);
            onChange(Number.isNaN(parsed) ? raw : parsed);
          }}
          className={cn(controlBase, field.suffix && "pr-10", "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
        />
        {field.suffix && (
          <span className="pointer-events-none absolute right-2 text-[10px] text-muted-foreground">
            {field.suffix}
          </span>
        )}
      </span>
    </FieldShell>
  );
}

function RangeControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "range" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : field.min;
  const display = Number.isNaN(numeric) ? field.min : numeric;
  return (
    <FieldShell
      id={field.key}
      label={field.label}
      required={field.required}
      description={field.description}
      disabled={disabled}
      className={field.className}
    >
      <div className="flex items-center gap-2">
        <input
          id={field.key}
          type="range"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={display}
          disabled={disabled || field.disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-4 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <RangeReadout defaultValue={String(display)} />
      </div>
    </FieldShell>
  );
}

function SelectControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "select" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const options = useMemo(() => normalizeOptions(field.options), [field.options]);
  return (
    <FieldShell
      id={field.key}
      label={field.label}
      required={field.required}
      description={field.description}
      disabled={disabled}
      className={field.className}
    >
      <Select
        id={field.key}
        value={typeof value === "string" ? value : ""}
        disabled={disabled || field.disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {(!value || (value as string) === "") && (
          <option value="" disabled hidden>
            {field.placeholder ?? "Select…"}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Select>
    </FieldShell>
  );
}

function RadioControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "radio" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const options = useMemo(() => normalizeOptions(field.options), [field.options]);
  return (
    <FieldShell
      id={field.key}
      label={field.label}
      required={field.required}
      description={field.description}
      disabled={disabled}
      className={field.className}
    >
      <SelradixOptions
        options={options}
        value={typeof value === "string" ? value : ""}
        onSelect={(v) => onChange(v)}
        disabled={disabled || field.disabled}
      />
    </FieldShell>
  );
}

function SelradixOptions({
  options,
  value,
  onSelect,
  disabled,
}: {
  options: FieldOption[];
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  if (options.length <= 3) {
    return (
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled || option.disabled}
              onClick={() => onSelect(option.value)}
              className={cn(
                "h-7 rounded-sm border px-2.5 text-xs font-medium transition-colors duration-150",
                active
                  ? "border-primary/60 bg-primary/15 text-foreground ring-1 ring-primary/40"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <Segmented
      options={options.map((o) => ({ value: o.value, label: o.label }))}
      value={value || options[0]?.value || ""}
      onChange={onSelect}
    />
  );
}

function ToggleControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "toggle" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const checked = Boolean(value);
  return (
    <div className={cn("flex items-center gap-2", field.className)}>
      <Switch
        checked={checked}
        onCheckedChange={(v) => onChange(v)}
        disabled={disabled || field.disabled}
      />
      {(field.label || field.description) && (
        <div className="flex flex-col">
          {field.label && (
            <span className={cn(labelClass, (disabled || field.disabled) && "opacity-50")}>
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </span>
          )}
          {field.description && <p className={hintClass}>{field.description}</p>}
        </div>
      )}
    </div>
  );
}

function ColorControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Extract<FieldConfig, { type: "color" }>;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}) {
  const hex = typeof value === "string" ? value : "";
  return (
    <FieldShell
      id={field.key}
      label={field.label}
      required={field.required}
      description={field.description}
      disabled={disabled}
      className={field.className}
    >
      <div className="flex items-center gap-2">
        <input
          id={field.key}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000"}
          disabled={disabled || field.disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-12 shrink-0 cursor-pointer rounded-sm border border-input bg-surface p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          type="text"
          value={hex}
          disabled={disabled || field.disabled}
          placeholder="#000000"
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, "font-mono uppercase")}
        />
      </div>
    </FieldShell>
  );
}

function renderField(
  field: FieldConfig,
  values: FieldValues,
  onChange: (key: string, value: FieldValue) => void,
  disabled?: boolean,
): React.ReactNode {
  const change = (key: string) => (value: FieldValue) => onChange(key, value);
  const value = field.type === "group" ? undefined : values[field.key];

  switch (field.type) {
    case "text":
    case "email":
    case "url":
    case "password":
    case "search":
      return (
        <FieldShell
          id={field.key}
          label={field.label}
          required={field.required}
          description={field.description}
          disabled={disabled}
          className={field.className}
        >
          <input
            id={field.key}
            type={field.type}
            value={typeof value === "string" ? value : ""}
            disabled={disabled || field.disabled}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            onChange={(e) => change(field.key)(e.target.value)}
            className={controlBase}
          />
        </FieldShell>
      );
    case "textarea":
      return (
        <TextareaControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "number":
      return (
        <NumberControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "range":
      return (
        <RangeControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "select":
      return (
        <SelectControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "radio":
      return (
        <RadioControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "toggle":
      return (
        <ToggleControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "color":
      return (
        <ColorControl field={field} value={value} onChange={change(field.key)} disabled={disabled} />
      );
    case "group":
      return (
        <fieldset
          className={cn(
            "flex flex-col gap-2.5 rounded-sm border border-border bg-surface/50 p-2.5",
            field.className,
          )}
        >
          {(field.label || field.description) && (
            <legend className="flex flex-col gap-0.5 px-1">
              {field.label && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  {field.label}
                  {field.columns === 2 && (
                    <Badge variant="outline" className="normal-case">
                      {field.fields.length} fields
                    </Badge>
                  )}
                </span>
              )}
              {field.description && <span className={hintClass}>{field.description}</span>}
            </legend>
          )}
          <div
            className={cn(
              "grid gap-2.5",
              field.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
            )}
          >
            {field.fields.map((child) =>
              renderField(child, values, onChange, disabled),
            )}
          </div>
        </fieldset>
      );
  }
}

export function Fields({
  fields,
  values: externalValues,
  onChange,
  disabled,
  columns = 1,
  className,
}: FieldsProps) {
  const internal = useFields(collectDefaults(fields));
  const values: FieldValues = externalValues ?? internal.values;

  const handleChange = (key: string, value: FieldValue) => {
    if (externalValues !== undefined) {
      onChange?.({ ...externalValues, [key]: value }, key, value);
      return;
    }
    internal.setField(key, value);
    onChange?.({ ...internal.values, [key]: value }, key, value);
  };

  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {fields.map((field) => renderField(field, values, handleChange, disabled))}
    </div>
  );
}

export function FieldsPreview({ fields }: { fields: FieldConfig[] }) {
  const { values, setField } = useFields(collectDefaults(fields));
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="rounded-sm border border-border bg-surface p-3">
        <Fields fields={fields} values={values} onChange={(_, key, value) => setField(key, value)} />
      </div>
      <div className="flex flex-col gap-1 border-t border-border pt-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Values
        </span>
        <pre className="overflow-x-auto whitespace-pre rounded-sm bg-background p-2 font-mono text-[11px] leading-relaxed text-foreground">
          {JSON.stringify(values, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default Fields;