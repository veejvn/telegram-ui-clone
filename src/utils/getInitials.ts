export function getInitials(displayName: string): string {
  if (!displayName) return "";
  return displayName
    .split(" ")
    .filter(word => word.trim().length > 0)
    .map(word => word[0].toUpperCase())
    .join("");
}
