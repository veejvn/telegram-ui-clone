export enum EventName {
  acceptCall = "acceptCall",
  rejectCall = "rejectCall",
}

export interface IEventPayload {
  appName: string;
  nameCaller: string; // Name of the caller
  normalHandle: number;
  uuid: string; // Unique identifier for the call
  duration: number; // Duration of the call in seconds
  id: string; // Unique identifier for the event
  extra: {
    platform: string;
    user: string;
  };
  type: number; // 0 = voice, 1 = video
  handle: string;
}
