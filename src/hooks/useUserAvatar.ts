import { useState, useEffect, useRef } from "react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { avatarService } from "@/services/avatarService";

/**
 * Hook to get user avatar URL from Matrix client
 */
export function useUserAvatar(userId?: string) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const client = useMatrixClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!client || !userId) {
      setAvatarUrl(null);
      setLoading(false);
      lastUserIdRef.current = userId;
      return;
    }

    // Skip if same userId as previous
    if (lastUserIdRef.current === userId && avatarUrl !== null) {
      return;
    }

    lastUserIdRef.current = userId;

    const fetchAvatar = async () => {
      try {
        setLoading(true);

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const url = await avatarService.getUserAvatar(client, userId);

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        setAvatarUrl(url);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled, don't log error
        }
        console.warn("Failed to fetch user avatar:", error);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    };

    fetchAvatar();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [client, userId]);

  return { avatarUrl, loading };
}
