import { cn } from "../../lib";

export type FieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  description?: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  htmlFor,
  description,
  required,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : description ? (
        <p className="text-[11px] leading-snug text-muted-foreground/80">{description}</p>
      ) : null}
    </div>
  );
}

export default Field;