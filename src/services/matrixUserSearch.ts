"use client";
import * as sdk from "matrix-js-sdk";

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

    const possibleUserIds = hasDomain
      ? [searchTerm]
      : [`${searchTerm}:${defaultDomain}`];

    for (const userId of possibleUserIds) {
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
        // thử user_id tiếp theo (ở đây chỉ có 1 domain thôi)
      }
    }
    return [];
  }

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
