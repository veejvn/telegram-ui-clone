import { useEffect, useState } from "react";
import { MatrixClient, MatrixEvent } from "matrix-js-sdk";

export const useUserPresence = (client: MatrixClient, userId: string) => {
  const [lastActiveAgo, setLastActiveAgo] = useState<number | null>(null);
  const [presenceTs, setPresenceTs] = useState<number | null>(null);

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const presence = await client.getPresence(userId);
        setLastActiveAgo(presence.last_active_ago ?? null);
        setPresenceTs(Date.now() - (presence.last_active_ago ?? 0));
      } catch (err) {
        console.error("Failed to get presence", err);
      }
    };

    fetchPresence();

    const onPresence = (event: MatrixEvent) => {
      if (event.getSender() === userId) {
        const content = event.getContent();
        setLastActiveAgo(content.last_active_ago ?? null);
        setPresenceTs(Date.now() - (content.last_active_ago ?? 0));
      }
    };

    client.on("event.presence", onPresence);

    return () => {
      client.removeListener("event.presence", onPresence);
    };
  }, [client, userId]);

  const lastSeen = presenceTs ? new Date(presenceTs) : null;

  return {
    lastSeen,
  };
};
