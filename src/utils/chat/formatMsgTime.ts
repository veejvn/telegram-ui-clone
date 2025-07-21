export const formatMsgTime = (dateInput: string | number | Date): string => {
  if (typeof dateInput === "string") {
    // Dạng "20/07/2025, 00:54:29"
    const match = dateInput.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2}):(\d{2})$/
    );
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      // Tạo đối tượng Date (lưu ý: tháng trong JS bắt đầu từ 0)
      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );
      if (!isNaN(date.getTime())) {
        const h = date.getHours().toString().padStart(2, "0");
        const m = date.getMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
      }
    }
    // Nếu không match, thử parse như cũ
    const timeMatch = dateInput.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, "0");
      const minutes = timeMatch[2].padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  }
  // Trường hợp khác (timestamp, Date object)
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "--:--";
  }
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
