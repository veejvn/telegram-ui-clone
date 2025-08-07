//matrixUserSearch.ts
"use client";
import * as sdk from "matrix-js-sdk";

/**
 * Tìm kiếm user theo username hoặc một phần của tên hiển thị
 * Người dùng chỉ cần nhập "username" và hàm sẽ tự động tìm tất cả người dùng có chứa từ khóa
 * Cải tiến: Hỗ trợ tìm kiếm không phân biệt hoa thường
 */
export async function searchMatrixUsers(
  client: sdk.MatrixClient,
  searchTerm: string
) {
  if (!searchTerm || searchTerm.trim().length === 0) return [];

  // Chuẩn hóa từ khóa tìm kiếm - giữ nguyên cả hoa thường để hiển thị
  const originalTerm = searchTerm.trim();
  // Chuyển về lowercase để tìm kiếm không phân biệt hoa thường
  const normalizedTerm = originalTerm.toLowerCase();

  // Kết quả tìm kiếm
  let results: any[] = [];

  // Lấy domain từ homeserver
  const defaultDomain = client
    .getHomeserverUrl()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // BƯỚC 1: Tạo các biến thể để thử tìm theo user ID
  const userIdVariants = [];

  // Nếu đã có @ thì giữ nguyên, nếu không thì thêm vào
  // Quan trọng: Giữ nguyên cả hoa thường trong username
  const username = normalizedTerm.startsWith("@")
    ? normalizedTerm
    : `@${normalizedTerm}`;

  // Nếu đã có domain thì giữ nguyên, nếu không thì thêm vào
  if (username.includes(":")) {
    userIdVariants.push(username);
  } else {
    userIdVariants.push(`${username}:${defaultDomain}`);
  }

  // BƯỚC 2: Thử tìm theo user ID đầy đủ
  for (const userId of userIdVariants) {
    try {
      const profile = await client.getProfileInfo(userId);

      if (profile) {
        results.push({
          user_id: userId,
          display_name: profile.displayname || userId,
          avatar_url: profile.avatar_url || "",
        });
      }
    } catch (e) {
      // Không tìm thấy user với ID này
    }
  }

  // BƯỚC 3: Luôn tìm trong directory để có kết quả đầy đủ
  try {
    // Chú ý: Gửi từ khóa gốc để bảo toàn các chữ hoa trong tìm kiếm API
    const directoryResult = await client.searchUserDirectory({
      term: originalTerm,
      limit: 100,
    });

    if (Array.isArray(directoryResult?.results)) {
      // Thêm kết quả từ directory, loại bỏ trùng lặp
      directoryResult.results.forEach((user: any) => {
        if (
          !results.some(
            (r) => r.user_id.toLowerCase() === user.user_id.toLowerCase()
          )
        ) {
          results.push({
            user_id: user.user_id,
            display_name: user.display_name || user.user_id,
            avatar_url: user.avatar_url || "",
          });
        }
      });
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm trong directory:", error);
  }

  // BƯỚC 4: Tìm trong rooms hiện có (đặc biệt quan trọng cho tìm kiếm một phần tên)
  try {
    const rooms = client.getRooms();
    const termWithoutDiacritics = removeVietnameseTones(normalizedTerm);

    for (const room of rooms) {
      // Lấy tất cả thành viên trong phòng (bỏ qua phòng nhóm lớn để tối ưu hiệu suất)
      if (room.getJoinedMemberCount() > 20) continue;

      const members = room.getJoinedMembers();

      for (const member of members) {
        // Bỏ qua nếu là chính mình
        if (member.userId === client.getUserId()) continue;

        // Chuẩn hóa tên để so sánh (chuyển về lowercase)
        const memberName = (member.name || "").toLowerCase();
        const memberNameWithoutDiacritics = removeVietnameseTones(memberName);
        const memberId = member.userId.toLowerCase();

        // Tách userId để lấy username (bỏ @ và domain)
        const usernameFromId = memberId.split(":")[0].substring(1);

        // Tìm kiếm với nhiều tiêu chí khác nhau - đều đã lowercase
        if (
          memberName.includes(normalizedTerm) ||
          memberNameWithoutDiacritics.includes(termWithoutDiacritics) ||
          memberId.includes(normalizedTerm) ||
          usernameFromId.includes(normalizedTerm)
        ) {
          // Nếu chưa có trong results - so sánh lowercase để tránh trùng lặp
          if (
            !results.some(
              (r) => r.user_id.toLowerCase() === member.userId.toLowerCase()
            )
          ) {
            let avatarUrl = null;
            try {
              if (member.getAvatarUrl) {
                avatarUrl = member.getAvatarUrl(
                  client.getHomeserverUrl(),
                  60,
                  60,
                  "crop",
                  false,
                  false,
                  false
                );
              }
            } catch (e) {
              // Không lấy được avatar
            }

            results.push({
              user_id: member.userId, // Giữ nguyên user_id gốc với đúng hoa thường
              display_name: member.name || member.userId, // Giữ nguyên tên hiển thị
              avatar_url: avatarUrl || "",
              // Thêm điểm ưu tiên để sắp xếp - so sánh lowercase
              match_priority:
                memberName === normalizedTerm
                  ? 10
                  : memberName.startsWith(normalizedTerm)
                  ? 5
                  : 1,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm trong rooms:", error);
  }

  // BƯỚC 5: Thử với các biến thể của từ khóa (để tìm được "hoang" → "Hoàng Vệ")
  try {
    // Mở rộng tìm kiếm với từ khóa không dấu
    const termWithoutDiacritics = removeVietnameseTones(normalizedTerm);

    // Nếu từ khóa đã được chuyển đổi thì tìm kiếm với phiên bản không dấu
    if (termWithoutDiacritics !== normalizedTerm) {
      // Tìm trong directory với phiên bản không dấu
      try {
        const directoryResult = await client.searchUserDirectory({
          term: termWithoutDiacritics,
          limit: 100,
        });

        if (Array.isArray(directoryResult?.results)) {
          directoryResult.results.forEach((user: any) => {
            if (
              !results.some(
                (r) => r.user_id.toLowerCase() === user.user_id.toLowerCase()
              )
            ) {
              results.push({
                user_id: user.user_id,
                display_name: user.display_name || user.user_id,
                avatar_url: user.avatar_url || "",
              });
            }
          });
        }
      } catch (error) {
        // Lỗi khi tìm kiếm không dấu trong directory
      }
    }

    // Thử tìm kiếm với viết hoa chữ cái đầu nếu người dùng nhập toàn chữ thường
    if (
      originalTerm === originalTerm.toLowerCase() &&
      originalTerm !== originalTerm.toUpperCase()
    ) {
      const capitalizedTerm =
        originalTerm.charAt(0).toUpperCase() + originalTerm.slice(1);

      try {
        const directoryResult = await client.searchUserDirectory({
          term: capitalizedTerm,
          limit: 100,
        });

        if (Array.isArray(directoryResult?.results)) {
          directoryResult.results.forEach((user: any) => {
            if (
              !results.some(
                (r) => r.user_id.toLowerCase() === user.user_id.toLowerCase()
              )
            ) {
              results.push({
                user_id: user.user_id,
                display_name: user.display_name || user.user_id,
                avatar_url: user.avatar_url || "",
                match_priority: 4, // Ưu tiên kết quả viết hoa đúng
              });
            }
          });
        }
      } catch (error) {
        // Lỗi khi tìm kiếm với chữ hoa đầu
      }
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm với biến thể từ khóa:", error);
  }

  // BƯỚC 6: Loại bỏ các kết quả trùng lặp (case insensitive)
  const uniqueResults: any[] = [];
  const seenUserIds = new Set();

  results.forEach((user) => {
    const lowercaseId = user.user_id.toLowerCase();
    if (!seenUserIds.has(lowercaseId)) {
      seenUserIds.add(lowercaseId);
      uniqueResults.push(user);
    } else {
      // Loại bỏ kết quả trùng lặp
    }
  });

  // Gán lại kết quả sau khi đã lọc trùng
  results = uniqueResults;

  // Sắp xếp kết quả - ưu tiên tên hiển thị khớp với từ khóa
  results.sort((a, b) => {
    const aName = (a.display_name || "").toLowerCase();
    const bName = (b.display_name || "").toLowerCase();

    // Nếu có điểm ưu tiên
    if (a.match_priority && b.match_priority) {
      if (a.match_priority > b.match_priority) return -1;
      if (a.match_priority < b.match_priority) return 1;
    }

    // Nếu tên chính xác trùng khớp (không phân biệt hoa thường)
    if (aName === normalizedTerm && bName !== normalizedTerm) return -1;
    if (bName === normalizedTerm && aName !== normalizedTerm) return 1;

    // Nếu tên bắt đầu bằng từ khóa
    if (aName.startsWith(normalizedTerm) && !bName.startsWith(normalizedTerm))
      return -1;
    if (bName.startsWith(normalizedTerm) && !aName.startsWith(normalizedTerm))
      return 1;

    // Ưu tiên kết quả ngắn hơn (thường là chính xác hơn)
    if (aName.length < bName.length) return -1;
    if (bName.length < aName.length) return 1;

    // Sắp xếp theo tên
    return aName.localeCompare(bName);
  });

  return results;
}

// Hàm bỏ dấu tiếng Việt cải tiến - đảm bảo kết quả luôn là chữ thường
export function removeVietnameseTones(str: string) {
  if (!str) return "";

  // Đảm bảo chuyển về lowercase trước khi xử lý
  str = str.toLowerCase();

  // Xóa dấu
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Thay thế đ/Đ
  str = str.replace(/[đĐ]/g, "d");

  return str;
}
