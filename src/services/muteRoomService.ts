import { MatrixClient } from "matrix-js-sdk";

const RULE_KIND = "override";

// Thêm rule để tắt thông báo phòng
export async function muteRoom(client: MatrixClient, roomId: string): Promise<void> {
  try {
    const rule = {
      actions: ["dont_notify"],
      conditions: [
        {
          kind: "event_match",
          key: "room_id",
          pattern: roomId,
        },
      ],
      rule_id: roomId,
      enabled: true,
    };

    await (client.http as any).authedRequest(
      "PUT",
      `/pushrules/global/${RULE_KIND}/${encodeURIComponent(roomId)}`,
      undefined,
      rule
    );
  } catch (error) {
    console.error("Mute room failed:", error);
  }
}


/**
 * Remove any existing push rule for the room to revert to "Match default setting"
 */
export async function unmuteRoom(client: MatrixClient, roomId: string): Promise<void> {
    const kinds = ["override", "room"]; // Check both kinds just in case
  
    for (const kind of kinds) {
      try {
        await (client.http as any).authedRequest(
          "DELETE",
          `/pushrules/global/${kind}/${encodeURIComponent(roomId)}`
        );
      } catch (error: any) {
        if (error.httpStatus !== 404) {
          console.error(`Failed to delete push rule [${kind}] for room ${roomId}:`, error);
        }
      }
    }
  }
  

// Kiểm tra xem room đã bị mute chưa
export async function isRoomMuted(client: MatrixClient, roomId: string): Promise<boolean> {
  try {
    const response = await client.getPushRules();
    const rules = response.global?.[RULE_KIND] || [];
    return rules.some((rule: any) =>
      rule.rule_id === roomId &&
      rule.actions?.includes("dont_notify") &&
      rule.enabled !== false
    );
  } catch (error) {
    console.error("Check mute status failed:", error);
    return false;
  }
}
