import { MatrixClient } from "matrix-js-sdk";

/**
 * Service to fetch and cache user avatars
 */
class AvatarService {
  private avatarCache = new Map<string, string | null>();
  private fetchingPromises = new Map<string, Promise<string | null>>();

  async getUserAvatar(
    client: MatrixClient,
    userId: string
  ): Promise<string | null> {
    // Check cache first
    if (this.avatarCache.has(userId)) {
      return this.avatarCache.get(userId) || null;
    }

    // Check if already fetching this userId
    if (this.fetchingPromises.has(userId)) {
      return this.fetchingPromises.get(userId)!;
    }

    // Create new fetch promise
    const fetchPromise = this.fetchAvatarFromMatrix(client, userId);
    this.fetchingPromises.set(userId, fetchPromise);

    try {
      const result = await fetchPromise;
      this.avatarCache.set(userId, result);
      return result;
    } finally {
      this.fetchingPromises.delete(userId);
    }
  }

  private async fetchAvatarFromMatrix(
    client: MatrixClient,
    userId: string
  ): Promise<string | null> {
    try {
      // Get user profile from Matrix
      const profile = await client.getProfileInfo(userId);

      if (profile?.avatar_url) {
        // Convert mxc:// URL to http URL
        const httpUrl = client.mxcUrlToHttp(profile.avatar_url, 64, 64, "crop");
        return httpUrl;
      } else {
        return null;
      }
    } catch (error) {
      console.warn("Failed to fetch user avatar:", error);
      return null;
    }
  }

  clearCache() {
    this.avatarCache.clear();
    this.fetchingPromises.clear();
  }

  removeFromCache(userId: string) {
    this.avatarCache.delete(userId);
    this.fetchingPromises.delete(userId);
  }
}

export const avatarService = new AvatarService();
