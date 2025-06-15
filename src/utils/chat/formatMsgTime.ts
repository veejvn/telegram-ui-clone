export const formatMsgTime = (dateInput: string | number | Date): string => {
  if (typeof dateInput === "string") {
    // Trường hợp chuỗi dạng "21:07:47 15/6/2025"
    // Tách phần giờ:phút:giây
    const timeMatch = dateInput.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      // Lấy giờ và phút
      const hours = timeMatch[1].padStart(2, "0");
      const minutes = timeMatch[2].padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  }
  // Trường hợp khác (timestamp, Date object)
  const date = new Date(dateInput);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
