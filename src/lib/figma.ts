export function figmaEmbedUrl(fileUrl: string, theme: "light" | "dark" = "dark"): string {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
    fileUrl,
  )}&theme=${theme}`;
}

export function isFigmaUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.hostname === "www.figma.com" || u.hostname === "figma.com";
  } catch {
    return false;
  }
}