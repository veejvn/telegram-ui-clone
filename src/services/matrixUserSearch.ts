//matrixUserSearch.ts
"use client";
import * as sdk from "matrix-js-sdk";

/**
 * Tìm kiếm user theo username hoặc một phần của tên hiển thị
 * Người dùng chỉ cần nhập "username" và hàm sẽ tự động tìm tất cả người dùng có chứa từ khóa
 */
export async function searchMatrixUsers(
  client: sdk.MatrixClient,
  searchTerm: string
) {
  if (!searchTerm || searchTerm.trim().length === 0) return []; // Chuẩn hóa từ khóa tìm kiếm

  const normalizedTerm = searchTerm.trim();
  console.log("Tìm kiếm với từ khóa:", normalizedTerm); // Kết quả tìm kiếm

  let results: any[] = []; // Lấy domain từ homeserver

  const defaultDomain = client
    .getHomeserverUrl()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, ""); // BƯỚC 1: Tạo các biến thể để thử tìm theo user ID

  const userIdVariants = []; // Nếu đã có @ thì giữ nguyên, nếu không thì thêm vào

  const username = normalizedTerm.startsWith("@")
    ? normalizedTerm
    : `@${normalizedTerm}`; // Nếu đã có domain thì giữ nguyên, nếu không thì thêm vào

  if (username.includes(":")) {
    userIdVariants.push(username);
  } else {
    userIdVariants.push(`${username}:${defaultDomain}`);
  }

  console.log("Thử tìm với các biến thể:", userIdVariants); // BƯỚC 2: Thử tìm theo user ID đầy đủ

  for (const userId of userIdVariants) {
    try {
      console.log("Thử tìm với ID:", userId);
      const profile = await client.getProfileInfo(userId);

      if (profile) {
        results.push({
          user_id: userId,
          display_name: profile.displayname || userId,
          avatar_url: profile.avatar_url || "",
        });
        console.log("Tìm thấy theo ID:", profile);
      }
    } catch (e) {
      console.log(`Không tìm thấy user với ID: ${userId}`);
    }
  } // BƯỚC 3: Luôn tìm trong directory để có kết quả đầy đủ

  try {
    console.log("Tìm kiếm trong directory với từ khóa:", normalizedTerm);

    const directoryResult = await client.searchUserDirectory({
      term: normalizedTerm,
      limit: 100,
    });

    if (Array.isArray(directoryResult?.results)) {
      console.log(
        `Tìm thấy ${directoryResult.results.length} kết quả từ directory`
      ); // Thêm kết quả từ directory, loại bỏ trùng lặp

      directoryResult.results.forEach((user: any) => {
        if (!results.some((r) => r.user_id === user.user_id)) {
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
  } // BƯỚC 4: Tìm trong rooms hiện có (đặc biệt quan trọng cho tìm kiếm một phần tên)

  try {
    console.log("Tìm kiếm trong rooms hiện có...");
    const rooms = client.getRooms();
    const termLower = normalizedTerm.toLowerCase();
    const termWithoutDiacritics = removeVietnameseTones(termLower);

    for (const room of rooms) {
      // Lấy tất cả thành viên trong phòng (bỏ qua phòng nhóm lớn để tối ưu hiệu suất)
      if (room.getJoinedMemberCount() > 20) continue;

      const members = room.getJoinedMembers();

      for (const member of members) {
        // Bỏ qua nếu là chính mình
        if (member.userId === client.getUserId()) continue; // Chuẩn hóa tên để so sánh

        const memberName = (member.name || "").toLowerCase();
        const memberNameWithoutDiacritics = removeVietnameseTones(memberName);
        const memberId = member.userId.toLowerCase(); // Tách userId để lấy username (bỏ @ và domain)

        const usernameFromId = memberId.split(":")[0].substring(1); // Tìm kiếm với nhiều tiêu chí khác nhau

        if (
          memberName.includes(termLower) ||
          memberNameWithoutDiacritics.includes(termWithoutDiacritics) ||
          memberId.includes(termLower) ||
          usernameFromId.includes(termLower)
        ) {
          // Nếu chưa có trong results
          if (!results.some((r) => r.user_id === member.userId)) {
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
              console.log("Không lấy được avatar");
            }

            results.push({
              user_id: member.userId,
              display_name: member.name || member.userId,
              avatar_url: avatarUrl || "", // Thêm điểm ưu tiên để sắp xếp
              match_priority:
                memberName === termLower
                  ? 10
                  : memberName.startsWith(termLower)
                  ? 5
                  : 1,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm trong rooms:", error);
  } // BƯỚC 5: Thử với các biến thể của từ khóa (để tìm được "hoang" → "Hoàng Vệ")

  try {
    // Mở rộng tìm kiếm với từ khóa không dấu
    const termWithoutDiacritics = removeVietnameseTones(
      normalizedTerm.toLowerCase()
    ); // Nếu từ khóa đã được chuyển đổi thì tìm kiếm với phiên bản không dấu

    if (termWithoutDiacritics !== normalizedTerm.toLowerCase()) {
      console.log(
        "Tìm kiếm bổ sung với từ khóa không dấu:",
        termWithoutDiacritics
      ); // Tìm trong directory với phiên bản không dấu

      try {
        const directoryResult = await client.searchUserDirectory({
          term: termWithoutDiacritics,
          limit: 100,
        });

        if (Array.isArray(directoryResult?.results)) {
          directoryResult.results.forEach((user: any) => {
            if (!results.some((r) => r.user_id === user.user_id)) {
              results.push({
                user_id: user.user_id,
                display_name: user.display_name || user.user_id,
                avatar_url: user.avatar_url || "",
              });
            }
          });
        }
      } catch (error) {
        console.log("Lỗi khi tìm kiếm không dấu trong directory");
      }
    }
  } catch (error) {
    console.error("Lỗi khi tìm kiếm với biến thể không dấu:", error);
  } // BƯỚC 6: Loại bỏ các kết quả trùng lặp

  const uniqueResults: any[] = [];
  const seenUserIds = new Set();

  results.forEach((user) => {
    if (!seenUserIds.has(user.user_id)) {
      seenUserIds.add(user.user_id);
      uniqueResults.push(user);
    } else {
      console.log(`Loại bỏ kết quả trùng lặp: ${user.user_id}`);
    }
  }); // Gán lại kết quả sau khi đã lọc trùng

  results = uniqueResults;
  console.log(`Số kết quả sau khi loại bỏ trùng lặp: ${results.length}`); // Sắp xếp kết quả - ưu tiên tên hiển thị khớp với từ khóa

  results.sort((a, b) => {
    const aName = (a.display_name || "").toLowerCase();
    const bName = (b.display_name || "").toLowerCase();
    const term = normalizedTerm.toLowerCase(); // Nếu có điểm ưu tiên

    if (a.match_priority && b.match_priority) {
      if (a.match_priority > b.match_priority) return -1;
      if (a.match_priority < b.match_priority) return 1;
    } // Nếu tên chính xác trùng khớp

    if (aName === term && bName !== term) return -1;
    if (bName === term && aName !== term) return 1; // Nếu tên bắt đầu bằng từ khóa

    if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
    if (bName.startsWith(term) && !aName.startsWith(term)) return 1; // Ưu tiên kết quả ngắn hơn (thường là chính xác hơn)

    if (aName.length < bName.length) return -1;
    if (bName.length < aName.length) return 1; // Sắp xếp theo tên

    return aName.localeCompare(bName);
  });

  console.log(`Tổng cộng tìm thấy ${results.length} kết quả:`, results);
  return results;
}

// Hàm bỏ dấu tiếng Việt để hỗ trợ tìm kiếm không dấu
export function removeVietnameseTones(str: string) {
  if (!str) return "";
  str = str.toLowerCase();

  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Thay thế đ/Đ

  str = str.replace(/[đĐ]/g, "d");

  return str;
}
