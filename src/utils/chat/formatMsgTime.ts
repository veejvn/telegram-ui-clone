export const formatMsgTime = (dateInput: string | number | Date): string => {
  const date = new Date(dateInput);
  const hours = date.getHours().toString().padStart(2, "0"); // ví dụ: 08
  const minutes = date.getMinutes().toString().padStart(2, "0"); // ví dụ: 05
  return `${hours}:${minutes}`;
};
