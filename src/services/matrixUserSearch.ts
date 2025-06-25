import { MatrixClient } from "matrix-js-sdk";

export async function searchMatrixUsers(
  client: MatrixClient,
  searchTerm: string
) {
  const res = await client.searchUserDirectory({
    term: searchTerm,
    limit: 1000, // ✅ Bạn có thể tăng lên tùy ý, ví dụ 50 hoặc 100
  });
  return res && Array.isArray(res.results) ? res.results : [];
}
