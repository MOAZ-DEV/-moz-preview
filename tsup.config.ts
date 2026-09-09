import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false, 
  sourcemap: true,
  splitting: false,
  clean: true,
  external: ["react", "react-dom", "react-infinite-canvas"],
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.banner = {
      js: '"use client";',
    };
  },
  platform: "browser",
  target: "es2020",
});