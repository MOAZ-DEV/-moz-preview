export { CrowPreviewProvider, useCrowPreview, CrowPreviewProvider as MozPreviewProvider, useCrowPreview as useMozPreview } from "./components/provider";
export { Canvas } from "./components/canvas";
export { Viewport } from "./components/canvas/viewport";
export { Nav } from "./components/overlay/nav";
export { Dock } from "./components/overlay/dock";
export { KeybindingsHint } from "./components/overlay/keybindings-hint";
export { useIdle } from "./hooks/use-idle";
export * from "./types";
export { DEFAULT_BREAKPOINTS, DEFAULT_GAP, MIN_SCALE, MAX_SCALE } from "./lib/constants";
export { createCanvasItems, variantsFromItems } from "./lib/canvas-utils";
export { cn } from "./lib";

/* Design system primitives */
export { Button, IconButton } from "./components/ui/button";
export type { ButtonProps, IconButtonProps } from "./components/ui/button";
export { Input } from "./components/ui/input";
export type { InputProps } from "./components/ui/input";
export { Select } from "./components/ui/select";
export type { SelectProps } from "./components/ui/select";
export { Switch } from "./components/ui/switch";
export type { SwitchProps } from "./components/ui/switch";
export { Badge } from "./components/ui/badge";
export type { BadgeProps } from "./components/ui/badge";
export { Field } from "./components/ui/field";
export type { FieldProps } from "./components/ui/field";
export { Segmented } from "./components/ui/segmented";
export type { SegmentedProps, SegmentedOption } from "./components/ui/segmented";

/* Config-driven dynamic fields */
export { Fields, FieldsPreview } from "./components/fields/fields";
export type { FieldsProps } from "./components/fields/fields";
export { useFields } from "./components/fields/use-fields";
export type { UseFieldsResult } from "./components/fields/use-fields";
export {
  normalizeOptions,
  defaultValueFor,
  collectDefaults,
} from "./components/fields/types";
export type {
  FieldConfig,
  FieldValues,
  FieldValue,
  FieldOption,
  FieldOptionSource,
  BaseFieldConfig,
  TextFieldConfig,
  TextareaFieldConfig,
  NumberFieldConfig,
  RangeFieldConfig,
  SelectFieldConfig,
  ToggleFieldConfig,
  RadioFieldConfig,
  ColorFieldConfig,
  GroupFieldConfig,
} from "./components/fields/types";