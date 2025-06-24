export function formatTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);

  const isToday = now.toDateString() === date.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else if (now.getFullYear() !== date.getFullYear()) {
    return date.toLocaleDateString(); // e.g., 10/06/2023
  } else {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  }
}
