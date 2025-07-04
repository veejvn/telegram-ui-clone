"use client";
import * as sdk from "matrix-js-sdk";

const fallbackDomains = ["matrix.teknix.dev", "matrix.org"];

export async function searchMatrixUsers(
  client: sdk.MatrixClient,
  searchTerm: string
) {
  const isLikelyUserId = searchTerm.startsWith("@");

  if (isLikelyUserId) {
    const hasDomain = searchTerm.includes(":");
    const possibleUserIds = hasDomain
      ? [searchTerm]
      : fallbackDomains.map((domain) => `${searchTerm}:${domain}`);

    for (const userId of possibleUserIds) {
      try {
        const profile = await client.getProfileInfo(userId);
        return [
          {
            user_id: userId,
            display_name: profile?.displayname || "",
          },
        ];
      } catch (e) {
        // thử user_id tiếp theo
      }
    }
    return [];
  }

  const res = await client.searchUserDirectory({
    term: searchTerm,
    limit: 100,
  });

  return Array.isArray(res?.results) ? res.results : [];
}
