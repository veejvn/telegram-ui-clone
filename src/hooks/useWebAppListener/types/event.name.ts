export enum EventName {
  acceptCall = "acceptCall",
  rejectCall = "rejectCall",
}

export interface IEventPayload {
  appName: string;
  nameCaller: string; // Name of the caller (hiển thị trên UI)
  normalHandle: number;
  uuid: string; // Unique identifier for the call
  duration: number; // Duration of the call in seconds
  id: string; // Unique identifier for the event
  extra: {
    platform: string; // Ví dụ: 'ios', 'android'
    user: string; // User gửi event
    roomId: string; // Room ID để join vào call
    userId: string;
    callId: string; // CallID thực tế của cuộc gọi (thêm vào đây)
    // User ID của người nhận
  };
  type: number; // 0 = voice call, 1 = video call
  handle: string;
}

// ---
// Ví dụ payload đúng từ mobile:
// {
//   "appName": "TelegramClone",
//   "nameCaller": "Alice",
//   "normalHandle": 0,
//   "uuid": "abc-123",
//   "duration": 0,
//   "id": "event-xyz",
//   "extra": {
//     "platform": "ios",
//     "user": "alice",
//     "roomId": "!room123:matrix.org",
//     "userId": "@bob:matrix.org"
//   },
//   "type": 1, // 1 = video, 0 = voice
//   "handle": "call"
// }
