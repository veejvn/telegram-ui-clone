// export function getDetailedStatus(lastSeen: Date | null): string {
//   if (lastSeen) {
//     const now = new Date();
//     const diffMs = now.getTime() - lastSeen.getTime();
//     const diffMinutes = Math.floor(diffMs / (1000 * 60));
//     const diffHours = Math.floor(diffMinutes / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffMs < 30 * 1000) return "online";
//     if (diffMinutes < 60) return `Last seen ${diffMinutes} minutes ago`;
//     if (diffHours < 24) return `Last seen ${diffHours} hours ago`;
//     return "Last seen recently";
//   }
//   return "Last seen recently";
// }

export function getDetailedStatus(lastSeen: Date | null): string {
  if (lastSeen) {
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 30 * 1000) return "online";
    if (diffMinutes < 60) return `Last seen ${diffMinutes} minute(s) ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hour(s) ago`;

    if (diffDays === 1) return `Last seen yesterday`;
    if (diffDays <= 7) return `Last seen ${diffDays} day(s) ago`;
    return "Last seen over a week ago";
  }
  return "Last seen recently";
}
