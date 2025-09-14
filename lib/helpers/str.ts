export const nameFromPath = (path: string) => {
  if (!path) return "";

  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) ?? "/";
};
