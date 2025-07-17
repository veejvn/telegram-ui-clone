"use client";
import * as sdk from "matrix-js-sdk";

/**
 * Tìm kiếm user theo userId hoặc từ khóa (không phân biệt hoa thường).
 * Nếu nhập userId, thử cả dạng thường và dạng chuyển về chữ thường.
 */
export async function searchMatrixUsers(
  client: sdk.MatrixClient,
  searchTerm: string
) {
  const isLikelyUserId = searchTerm.startsWith("@");

  if (isLikelyUserId) {
    const hasDomain = searchTerm.includes(":");

    // Lấy domain động từ client
    const defaultDomain = client
      .getHomeserverUrl()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    // Tạo các biến thể userId để thử tìm (gốc và chuyển về chữ thường)
    const normalized = hasDomain
      ? [searchTerm, searchTerm.toLowerCase()]
      : [
          `${searchTerm}:${defaultDomain}`,
          `${searchTerm.toLowerCase()}:${defaultDomain}`,
        ];

    for (const userId of normalized) {
      try {
        const profile = await client.getProfileInfo(userId);
        return [
          {
            user_id: userId,
            display_name: profile?.displayname || "",
            avatar_url: profile?.avatar_url || "",
          },
        ];
      } catch (e) {
        // thử user_id tiếp theo
      }
    }
    return [];
  }

  // Nếu không phải userId, search directory (không phân biệt hoa thường)
  const res = await client.searchUserDirectory({
    term: searchTerm,
    limit: 100,
  });

  return Array.isArray(res?.results)
    ? res.results.map((u: any) => ({
        ...u,
        avatar_url: u.avatar_url || "",
      }))
    : [];
}
