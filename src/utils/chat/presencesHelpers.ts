export const getDetailedStatus = (lastSeen: Date | string | null) => {
  if (lastSeen) {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    
    // Tính toán khoảng thời gian
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    // Kiểm tra xem có phải cùng ngày không
    const isToday = now.toDateString() === lastSeenDate.toDateString();
    
    // Kiểm tra xem có phải hôm qua không
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === lastSeenDate.toDateString();
    
    // Format thời gian (HH:MM)
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };
    
    // Format ngày tháng cho trường hợp xa hơn
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    // Logic hiển thị trạng thái
    if (diffMinutes < 1) {
      return "online";
    } else if (diffMinutes < 5) {
      return "Last seen a few minutes ago";
    } else if (isToday) {
      return `Last seen today at ${formatTime(lastSeenDate)}`;
    } else if (isYesterday) {
      return `Last seen yesterday at ${formatTime(lastSeenDate)}`;
    } else if (diffHours < 168) { // Trong vòng 1 tuần
      const dayName = lastSeenDate.toLocaleDateString('en-US', { weekday: 'long' });
      return `Last seen ${dayName} at ${formatTime(lastSeenDate)}`;
    } else {
      return `Last seen ${formatDate(lastSeenDate)} at ${formatTime(lastSeenDate)}`;
    }
  }
  return "Last seen recently";
};