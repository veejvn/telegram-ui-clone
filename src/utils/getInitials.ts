export function getInitials(displayName: string | null): string {
  if (!displayName) return "YN";
  return displayName
    .split(" ")
    .filter(word => word.trim().length > 0)
    .map(word => word[0].toUpperCase())
    .join("");
}
