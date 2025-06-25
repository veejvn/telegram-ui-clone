import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";
import { vi } from "date-fns/locale"; // hoặc enUS nếu bạn dùng tiếng Anh

export function formatRelativeTime(date: Date): string {
  const now = new Date();

  const diffDays = differenceInCalendarDays(now, date);

  if (diffDays === 0) {
    // Cùng ngày -> hiển thị "x phút trước", "x giờ trước"
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else {
    return `${diffDays} ngày trước`;
  }
}