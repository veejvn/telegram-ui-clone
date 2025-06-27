"use client";
import * as sdk from "matrix-js-sdk";

export async function searchMatrixUsers(
  client: sdk.MatrixClient,
  searchTerm: string
) {
  // Nếu searchTerm là user ID đúng định dạng @user:domain
  const isUserId = searchTerm.startsWith("@") && searchTerm.includes(":");

  // Nếu đúng định dạng user ID → lấy profile trực tiếp
  if (isUserId) {
    try {
      const profile = await client.getProfileInfo(searchTerm);
      return [
        {
          user_id: searchTerm,
          display_name: profile?.displayname || "",
        },
      ];
    } catch (err) {
      // Không tìm thấy user → trả mảng rỗng
      return [];
    }
  }

  // Nếu không phải user ID → dùng search directory như bình thường
  const res = await client.searchUserDirectory({
    term: searchTerm,
    limit: 1000,
  });

  return res && Array.isArray(res.results) ? res.results : [];
}
