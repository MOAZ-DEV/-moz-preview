# Moz Preview
A library that helps display page responsive variants with pixel-perfect development support.

## Features
- Infinite canvas with pan, zoom, drag, and resize
- Responsive variant preview (desktop, tablet, mobile)
- Device focus mode (single variant zoom)
- Compact dark-first design system with violet/cyan signal accents
- Config-driven `Fields` component for building dynamic forms
- Full set of composable UI primitives (Button, Input, Select, Switch, Badge, Segmented, Field)

## Getting started

```bash
bun install @moz/preview
```

The compiled design-system stylesheet is **auto-injected** into `document.head` the first
time `CrowPreviewProvider` mounts — no CSS import needed. Preview iframes receive the same
tokens automatically.

```tsx
import { CrowPreviewProvider } from "@moz/preview";

export default function App() {
  return (
    <CrowPreviewProvider theme="dark">
      <YourPage />
    </CrowPreviewProvider>
  );
}
```

If you prefer to load the stylesheet yourself (e.g. for global use or SSR), import it in
your app entry and set `injectStyles={false}`:

```tsx
import "@moz/preview/styles.css";
```

### Provider props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Page component to preview |
| `breakpoints` | `Breakpoint[]` | `[{desktop:1440}, {tablet:768}, {mobile:390}]` | Preview viewport sizes |
| `initialPath` | `string` | `"/"` | Starting URL path |
| `theme` | `"light" \| "dark"` | `"dark"` | Theme mode |
| `className` | `string` | — | Additional classes on the root |

### Hooks

```tsx
import { useCrowPreview } from "@moz/preview";

const { state, dispatch } = useCrowPreview();
```

---

## Design system tokens

All tokens live in `@moz/preview/dist/index.css` (import automatically when using the provider).

**Key utilities:** `bg-surface`, `bg-surface-hover`, `bg-surface-active`, `text-muted-foreground`, `border-border-strong`, `ring-ring`, `rounded-xs/sm/md/lg`, `bg-grid`, `bg-dot-grid`.

Import the stylesheet directly when building standalone components:

```tsx
import "@moz/preview/styles.css";
```

---

## UI primitives

All primitives accept standard HTML props plus design-system `className` overrides.

```tsx
import { Button, IconButton, Input, Select, Switch, Badge, Segmented, Field } from "@moz/preview";
```

| Component | Variants / Sizes |
|-----------|-----------------|
| `Button` | variant: `default` `secondary` `outline` `ghost` `destructive` `link` · size: `xs` `sm` `md` |
| `IconButton` | size: `xs` `sm` — requires `label` for accessibility |
| `Input` | `text` `email` `url` `password` `search` + `invalid` prop |
| `Select` | Native select with styled chevron + `invalid` prop |
| `Switch` | `checked` + `onCheckedChange` — accessible toggle |
| `Badge` | variant: `default` `accent` `secondary` `outline` `success` `warning` `destructive` |
| `Segmented` | Tab-style segmented control (generics for type-safe values) |
| `Field` | Layout wrapper with label, description, required indicator |

---

## Dynamic Fields (config-driven forms)

Render forms from a JSON config array — no manual field wiring required.

```tsx
import { Fields, useFields } from "@moz/preview";
import type { FieldConfig } from "@moz/preview";

const config: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", placeholder: "Enter name" },
  { key: "role", label: "Role", type: "select", options: ["Admin", "Editor", "Viewer"] },
  { key: "notify", label: "Enable notifications", type: "toggle" },
  {
    type: "group",
    label: "Layout",
    columns: 2,
    fields: [
      { key: "cols", label: "Columns", type: "number", min: 1, max: 12, defaultValue: 4 },
      { key: "gap", label: "Gap", type: "range", min: 0, max: 40, defaultValue: 16 },
    ],
  },
];

function SettingsForm() {
  // useFields manages state internally from defaultValue on each field
  const { values, setField } = useFields();

  return (
    <Fields fields={config} values={values} onChange={(_, k, v) => setField(k, v)} columns={1} />
  );
}
```

### Field types

`text` · `email` · `url` · `password` · `search` · `textarea` · `number` · `range` · `select` · `toggle` · `radio` · `color` · `group`

### useFields

```ts
const { values, setField, clearField, setValues, reset, hasChanged } = useFields(initialValues);
```

---

## Building

```bash
bun run build    # build JS + CSS + type declarations
bun run dev      # watch mode
```

---

## Roadmap
- Click to open components in an IDE
- Export preview files
- Share live results online via peer-to-peer connection
- Store comments
- Extremely lightweight