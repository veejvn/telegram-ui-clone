"use client";

import { EventEmitter } from "events";
import * as sdk from "@/lib/matrix-sdk";
import { useAuthStore } from "@/stores/useAuthStore";

export type CallType = "voice" | "video";

export interface IncomingCall {
  roomId: string;
  callerId: string;
  callType: CallType;
}

const HOMESERVER_URL: string =
  process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.teknix.dev.org";

function createSilentAudioTrack(): MediaStreamTrack {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(
    ctx.createMediaStreamDestination()
  ) as MediaStreamAudioDestinationNode;
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
}

class CallService extends EventEmitter {
  // ✅ Singleton pattern - static instance
  private static instance: CallService | null = null;
  private static isInitializing = false;

  private client: sdk.MatrixClient | null = null;
  private currentCall?: sdk.MatrixCall;
  private currentRoomId?: string;
  private localStream?: MediaStream;

  private eventListenersRegistered = false; // ✅ Thêm flag để track event listeners

  // ✅ Private constructor để prevent direct instantiation
  private constructor() {
    super();
    console.log(
      "🚀 [CallService] Singleton instance created at:",
      new Date().toISOString()
    );
    this.initializeClient();
  }

  // ✅ Static method để get singleton instance
  public static getInstance(): CallService {
    if (CallService.instance) {
      console.log("🔄 [CallService] Returning existing singleton instance");
      return CallService.instance;
    }

    if (CallService.isInitializing) {
      console.warn(
        "⚠️ [CallService] Instance is being initialized, waiting..."
      );
      // Wait for initialization to complete
      while (CallService.isInitializing) {
        // Busy wait - in production you might want to use a promise
      }
      return CallService.instance!;
    }

    console.log("🆕 [CallService] Creating new singleton instance");
    CallService.isInitializing = true;
    CallService.instance = new CallService();
    CallService.isInitializing = false;

    return CallService.instance;
  }

  // ✅ Method to destroy singleton (for testing or cleanup)
  public static destroyInstance(): void {
    if (CallService.instance) {
      console.log("🗑️ [CallService] Destroying singleton instance");

      // Cleanup the instance
      try {
        if (CallService.instance.client) {
          CallService.instance.client.stopClient();
          (CallService.instance.client as any).removeAllListeners();
        }
        CallService.instance.removeAllListeners();
      } catch (error) {
        console.error("[CallService] Error during cleanup:", error);
      }

      CallService.instance = null;
      CallService.isInitializing = false;
    }
  }

  // ✅ Check if instance exists
  public static hasInstance(): boolean {
    return CallService.instance !== null;
  }

  public async findAndJoinOngoingCall(
    client: sdk.MatrixClient,
    roomId: string
  ) {
    const rooms = client.getRooms();

    for (const room of rooms) {
      if (roomId !== "" && room.roomId === roomId) {
        console.log("[CallService] Checking room for ongoing call:", room);
        await this.client?.scrollback(room, 10);
        const invite = room
          .getLiveTimeline()
          .getEvents()
          .filter((e: sdk.MatrixEvent) => {
            const age = Date.now() - e.getTs();
            return e.getType() === "m.call.invite" && age < 60000; // 1 minutes
          });

        console.log("[CallService] Ongoing call invite events:", invite);

        if (invite.length > 0) {
          const callId = invite[0].getContent().call_id;
          console.log("[CallService] Ongoing call found with ID:", callId);
          this.setupCallFromSync(
            invite[0],
            callId,
            "!GjGBadHVuqZYqWQxvZ:matrix.teknix.dev"
          );
        }
      }
    }
  }
  private initializeClient(roomId?: string) {
    // if (this.client) {
    //   console.warn(
    //     "[CallService] Client already initialized, skipping",
    //     this.client
    //   );
    //   return;
    // }

    console.log(
      "🔧 [CallService] Initializing Matrix client for singleton instance..."
    );
    const { accessToken, userId, deviceId } = useAuthStore.getState();
    console.log(
      "[CallService] initializeClient - accessToken:",
      !!accessToken, // Don't log actual token for security
      "userId:",
      userId,
      "deviceId:",
      deviceId
    );

    if (!accessToken || !userId || !deviceId) {
      return;
    }

    try {
      this.client = sdk.createClient({
        baseUrl: HOMESERVER_URL,
        accessToken,
        userId,
        deviceId,
      });

      this.client.startClient({ initialSyncLimit: 10 });
      if (!this.eventListenersRegistered) {
        (this.client as any).on(
          "Call.incoming",
          this.onIncomingCall.bind(this)
        );
        (this.client as any).once("sync", (state: any) => {
          if (state === "PREPARED") {
            if (roomId) {
              this.findAndJoinOngoingCall(this.client as any, roomId);
            }
          }
        });
        this.eventListenersRegistered = true;
        console.log("[CallService] Event listeners registered");
      }
      // console.log("[CallService] Client initialized successfully");
      // (this.client as any).on("Call.incoming", this.onIncomingCall.bind(this));
      // (this.client as any).once("sync", (state: any) => {
      //   if (state === "PREPARED") {
      //     // client đã sync xong → kiểm tra các room để tìm call đang diễn ra
      //     this.findAndJoinOngoingCall(this.client as any);
      //   }
      // });
    } catch (error) {
      console.error("[CallService] Failed to initialize client:", error);
      this.client = null;
    }
  }

  // Re-initialize client if needed (for example after login)
  public reinitialize(roomId: string) {
    console.log("🔄 [CallService] Reinitializing singleton instance");
    if (this.client) {
      try {
        (this.client as any).removeListener(
          "Call.incoming",
          this.onIncomingCall.bind(this)
        );
        this.client.stopClient();
        (this.client as any).removeAllListeners();
        this.eventListenersRegistered = false; // ✅ Reset flag
      } catch (error) {
        console.warn("[CallService] Error stopping previous client:", error);
      }
    }
    this.initializeClient(roomId);
  }

  private getClient(): sdk.MatrixClient {
    if (!this.client) {
      this.initializeClient();
      if (!this.client) {
        throw new Error("[CallService] Matrix client not available");
      }
    }
    return this.client;
  }

  private onIncomingCall(call: sdk.MatrixCall) {
    // ✅ Kiểm tra xem cuộc gọi này đã được xử lý chưa
    if (this.currentCall && this.currentCall.callId === call.callId) {
      console.log("[CallService] Call already handled, ignoring duplicate");
      return;
    }
    const opp = call.getOpponentMember();
    if (!opp) {
      // ✅ If no opponent member, try to get from call object
      return;
    }

    const callAny = call as any;
    const opponentId =
      callAny._opponentMember?.userId || callAny.getOpponentSessionId?.();

    this.currentCall = call;
    this.registerCallEvents(call);

    const isVideo = call.hasLocalUserMediaVideoTrack || call.type === "video";
    const callType: CallType = isVideo ? "video" : "voice";
    // console.log("caller id", opp.userId);
    this.emit("incoming-call", {
      roomId: call.roomId!,
      // callerId: opp.userId!,
      callerId: opp?.userId || opponentId,
      callType,
    });
  }

  private registerCallEvents(call: sdk.MatrixCall) {
    const c = call as any;

    // ✅ Đảm bảo không đăng ký event listeners nhiều lần
    c.removeAllListeners(); // Remove existing listeners first
    console.log("[CallService] registerCallEvents - Call state before:", {
      callId: call.callId,
      state: call.state,
      direction: call.direction,
      type: call.type,
      hasAnswer: typeof c.answer === "function",
      isAnswered: c.isAnswered || false,
      peerConnState: c.peerConn?.connectionState,
    });

    c.on("local_stream", (stream: MediaStream) => {
      this.localStream = stream;
      this.emit("local-stream", stream);
    });

    c.on("remote_stream", (stream: MediaStream) => {
      if (stream) {
        this.emit("remote-stream", stream);
        this.emit("connected");
      }
    });

    c.on("feeds_changed", () => {
      const feeds =
        typeof c.getRemoteFeeds === "function" ? c.getRemoteFeeds() : undefined;
      if (feeds && feeds.length > 0 && feeds[0].stream) {
        const stream = feeds[0].stream as MediaStream;
        this.emit("remote-stream", stream);
        this.emit("connected");
      }
    });

    // ✅ FIX: Thêm xử lý sự kiện từ chối cuộc gọi
    c.on("reject", (event: any) => {
      console.log("[CallService] Call rejected by remote party");
      this.emit("call-ended", "rejected");
      this.cleanup();
    });

    c.on("hangup", (event: any) => {
      const reason = event?.reason || "user_hangup";
      console.log("[CallService] Call hangup:", reason);

      // ✅ Cleanup local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // ✅ Cleanup peer connection tracks
      const callAny = call as any;
      if (callAny.peerConn) {
        const senders = callAny.peerConn.getSenders();
        senders.forEach((sender: RTCRtpSender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
      }

      // ✅ Delay cleanup để tránh race condition với events đến sau
      setTimeout(() => {
        this.emit("call-ended", reason);
        this.cleanup();
      }, 1000);
    });

    c.on("error", (err: Error) => {
      console.error("[CallService] Call error:", err);

      // ✅ Handle specific WebRTC errors
      if (
        err.message.includes("setRemoteDescription") ||
        err.message.includes("stable")
      ) {
        console.warn(
          "[CallService] WebRTC state conflict detected, ignoring error"
        );
        return;
      }

      this.emit("call-error", err);

      // ✅ Delay cleanup cho error cases
      setTimeout(() => {
        this.cleanup();
      }, 500);
    });
  }

  // ✅ FIX: Thêm method cleanup riêng
  private cleanup() {
    // ✅ Remove event listeners from current call
    if (this.currentCall) {
      const c = this.currentCall as any;
      c.removeAllListeners();
    }
    this.currentCall = undefined;
    this.currentRoomId = undefined;
    this.localStream = undefined;
    console.log("[CallService] Call cleanup completed");
  }

  public async placeCall(roomId: string, type: CallType) {
    if (this.currentCall) return;

    console.log("[CallService] Placing new call:", { roomId, type });

    const client = this.getClient();
    const call = client.createCall(roomId);
    if (!call) return;
    this.registerCallEvents(call);

    this.currentCall = call;
    this.currentRoomId = roomId;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    this.localStream = stream;

    const pc = (call as any).peerConn;
    if (pc) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    this.emit("local-stream", stream);
    if (type === "video") {
      await call.placeVideoCall();
    } else {
      await call.placeVoiceCall();
    }

    this.emit("outgoing-call", { roomId, callType: type });
  }

  public async setupCallFromSync(
    invite: sdk.MatrixEvent,
    callId: string,
    roomId: string
  ) {
    try {
      // ✅ Remove unreachable code below (after return statement)

      if (this.currentCall && this.currentCall.callId === callId) {
        console.log("[CallService] Call already handled, ignoring duplicate");
        return;
      }

      console.log("[CallService] Starting answerCallFromSync:", {
        callId,
        roomId,
      });

      // Create call object from Matrix client
      const call = this.client!.createCall(roomId) as sdk.MatrixCall;
      call.callId = callId;
      call.initWithInvite(invite);

      const callAny = call as any;

      // this.onIncomingCall(call);

      // console.log("[CallService] Call created from sync:", call);

      // // Set as current call and register events

      // // Determine if it's a video call
      const callContent = invite.getContent();
      const isVideo =
        callContent.offer?.type === "video" || call.type === "video";

      // // console.log("[CallService] Call type detected:", {
      // //   isVideo,
      // //   callType: call.type,
      // // });

      // // // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });

      this.localStream = stream;
      this.emit("local-stream", stream);

      // console.log("[CallService] Local stream obtained:", {
      //   audioTracks: stream.getAudioTracks().length,
      //   videoTracks: stream.getVideoTracks().length,
      // });

      const pc = call.peerConn;
      if (pc) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
        console.log("[CallService] Tracks added to peer connection");
      }

      this.currentCall = callAny;
      this.currentRoomId = roomId;
      this.registerCallEvents(callAny);

      const callType: CallType = isVideo ? "video" : "voice";
      const opponentId =
        (call as any)._opponentMember?.userId || call.getOpponentSessionId?.();

      this.emit("incoming-call", {
        roomId: call.roomId!,
        // callerId: opp.userId!,
        callerId: opponentId,
        callType,
      });
      return true;
    } catch (error) {
      console.error("[CallService] Failed to answer call from sync:", error);
      return false;
    }
  }

  public async answerCall() {
    console.log("[CallService] Answering call... step 1");
    if (!this.currentCall) return;

    console.log("[CallService] Current call step 2");

    const callAny = this.currentCall as any;

    try {
      const isVideo =
        this.currentCall.type === "video" ||
        callAny.hasLocalUserMediaVideoTrack;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });

      this.localStream = stream;
      this.emit("local-stream", stream);

      this.currentCall.answer(true, isVideo);

      console.log("[CallService] Answered call with local stream:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
        isVideo,
      });
    } catch (err) {
      console.error("[CallService] Failed to get user media for answer:", err);
      this.currentCall.answer();
    }
  }
  public getCallById(callId: string): sdk.MatrixCall | null {
    const client = this.getClient();

    // Tìm call trong danh sách calls hiện tại
    const calls = (client as any).callEventHandler?.calls;
    console.log("calls", calls);
    if (calls) {
      return calls.get(callId) || null;
    }

    return null;
  }

  public async answerCallById(callId: string) {
    const call = this.getCallById(callId);

    if (!call) {
      console.error(`[CallService] Call with ID ${callId} not found`);
      return false;
    }

    // Set current call
    this.currentCall = call;
    this.registerCallEvents(call);

    const callAny = call as any;

    try {
      const isVideo =
        call.type === "video" || callAny.hasLocalUserMediaVideoTrack;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });

      this.localStream = stream;
      this.emit("local-stream", stream);

      callAny.answer({ audio: true, video: isVideo });

      console.log(`[CallService] Answered call ${callId} with local stream:`, {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
        isVideo,
      });

      return true;
    } catch (err) {
      console.error(`[CallService] Failed to answer call ${callId}:`, err);
      callAny.answer();
      return false;
    }
  }
  private async waitForClientReady(timeoutMs = 15000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error("No Matrix client available"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Client ready timeout"));
      }, timeoutMs);

      const checkReady = () => {
        const state = this.client?.getSyncState();
        if (state === "SYNCING" || state === "PREPARED") {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkReady, 500);
        }
      };

      checkReady();
    });
  }
  private async findCallInRoomHistory(
    roomId: string,
    callId: string,
    originalTimestamp: number
  ): Promise<sdk.MatrixCall | null> {
    try {
      const client = this.getClient();
      const room = client.getRoom(roomId);

      if (!room) {
        console.log(`[CallService] Room ${roomId} not found`);
        return null;
      }

      // Get room timeline
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();

      // Look for call invite events near the original timestamp
      const targetTime = originalTimestamp;
      const timeWindow = 60000; // 1 minute window

      const callEvent = events.find((event) => {
        const eventTime = event.getTs();
        const timeDiff = Math.abs(eventTime - targetTime);

        return (
          event.getType() === "m.call.invite" &&
          event.getContent().call_id === callId &&
          timeDiff < timeWindow
        );
      });

      if (callEvent) {
        console.log(`[CallService] Found call event for ${callId}`);
        // Try to recreate call from event
        const call = client.createCall(roomId);
        if (call) {
          // Set the call ID to match
          (call as any).callId = callId;
          return call;
        }
      }

      return null;
    } catch (error) {
      console.error("[CallService] Error searching room history:", error);
      return null;
    }
  }
  private async createRecoveryCall(callInfo: {
    callId: string;
    roomId: string;
    callType: CallType;
    callerId?: string;
  }): Promise<sdk.MatrixCall | null> {
    try {
      const client = this.getClient();

      // Create a new call object
      const call = client.createCall(callInfo.roomId);
      if (!call) return null;

      // Override the call ID to match the original
      (call as any).callId = callInfo.callId;

      // Set call type
      (call as any).type = callInfo.callType;

      return call;
    } catch (error) {
      console.error("[CallService] Failed to create recovery call:", error);
      return null;
    }
  }
  private async attemptCallRecovery(callInfo: {
    callId: string;
    roomId: string;
    callType: CallType;
    timestamp: number;
    isIncoming: boolean;
    callerId?: string;
  }) {
    try {
      console.log(
        `[CallService] Attempting to recover call ${callInfo.callId}`
      );

      // Wait for client to be ready
      await this.waitForClientReady();

      // Try to find the call in recent room events
      const recoveredCall = await this.findCallInRoomHistory(
        callInfo.roomId,
        callInfo.callId,
        callInfo.timestamp
      );

      if (recoveredCall) {
        // Emit as incoming call to trigger UI
        this.emit("call-recovered", {
          ...callInfo,
          call: recoveredCall,
        });

        console.log(
          `[CallService] Successfully recovered call ${callInfo.callId}`
        );
        return true;
      } else {
        // If call not found, try to create a new call session
        const newCall = await this.createRecoveryCall(callInfo);
        if (newCall) {
          this.emit("call-recovered", {
            ...callInfo,
            call: newCall,
          });
          return true;
        }
      }

      console.log(`[CallService] Could not recover call ${callInfo.callId}`);
      // this.clearPersistentCall();
      return false;
    } catch (error) {
      console.error(`[CallService] Call recovery failed:`, error);
      // this.clearPersistentCall();
      return false;
    }
  }
  public async recoverPersistentCall(callInfo: {
    callId: string;
    roomId: string;
    callType: CallType;
    timestamp: number;
    isIncoming: boolean;
    callerId?: string;
  }) {
    // const stored = localStorage.getItem(CallService.PERSISTENT_CALL_KEY);
    // if (stored) {
    try {
      return await this.attemptCallRecovery(callInfo);
    } catch (error) {
      console.error("[CallService] Error recovering persistent call:", error);
      // this.clearPersistentCall();
    }
  }
  public triggerCallRecovery = async (callInfo: {
    callId: string;
    roomId: string;
    callType: CallType;
    timestamp: number;
    isIncoming: boolean;
    callerId?: string;
  }) => {
    // ✅ Use singleton instance instead of global variable
    const recovered = await CallService.getInstance().recoverPersistentCall(
      callInfo
    );
    if (recovered) {
      console.log("Call recovered successfully");
    }
  };

  // ✅ FIX: Thêm method để từ chối cuộc gọi
  public rejectCall() {
    if (!this.currentCall) return;

    console.log("[CallService] Rejecting call");

    try {
      // Matrix SDK method để từ chối cuộc gọi
      (this.currentCall as any).reject();

      // Emit event để UI biết cuộc gọi đã bị từ chối
      this.emit("call-ended", "rejected");

      // Cleanup
      this.cleanup();
    } catch (err) {
      console.error("[CallService] Failed to reject call:", err);
      // Fallback: force cleanup
      this.cleanup();
    }
  }

  public hangup() {
    if (!this.currentCall) return;

    console.log("[CallService] Manual hangup called");

    // ✅ Cleanup local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // ✅ Cleanup peer connection tracks
    const callAny = this.currentCall as any;
    if (callAny.peerConn) {
      const senders = callAny.peerConn.getSenders();
      senders.forEach((sender: RTCRtpSender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
    }

    // ✅ Call hangup với delay để tránh race condition
    try {
      (this.currentCall as any).hangup();
      console.log("[CallService] Hangup called successfully");
    } catch (err) {
      console.warn("[CallService] Hangup failed, forcing cleanup:", err);
      setTimeout(() => {
        this.emit("call-ended", "user_hangup");
        this.cleanup();
      }, 100);
    }
  }

  public async upgradeToVideo() {
    if (!this.currentCall) return;

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const videoTrack = videoStream.getVideoTracks()[0];
      videoTrack.enabled = true;

      const callAny = this.currentCall as any;

      const senders = callAny.peerConn?.getSenders?.();
      const videoSender = senders?.find(
        (sender: RTCRtpSender) => sender.track?.kind === "video"
      );

      if (videoSender) {
        await videoSender.replaceTrack(videoTrack);
      } else {
        callAny.peerConn?.addTrack?.(videoTrack, videoStream);
      }

      const audioTracks = this.localStream?.getAudioTracks() ?? [];
      const newStream = new MediaStream([...audioTracks, videoTrack]);
      callAny.localStream = newStream;
      this.localStream = newStream;

      this.emit("local-stream", newStream);

      if (typeof callAny._updateRemoteFeeds === "function") {
        callAny._updateRemoteFeeds();
      }
    } catch (err) {
      console.error("[CallService] Không thể bật camera:", err);
      alert(
        "Không thể bật camera: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  public async toggleCamera(on: boolean) {
    if (!this.currentCall) return;

    const callAny = this.currentCall as any;
    const pc = callAny.peerConn as RTCPeerConnection;
    const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");

    if (videoSender && videoSender.track) {
      videoSender.track.enabled = on;
      this.localStream?.getVideoTracks().forEach((t) => (t.enabled = on));
      this.emit("local-stream", this.localStream!);
    } else if (on) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoTrack = stream.getVideoTracks()[0];

        pc.addTrack(videoTrack, stream);
        this.localStream?.addTrack(videoTrack);
        this.emit("local-stream", this.localStream!);
      } catch (err) {
        console.error(
          "[CallService] toggleCamera failed to get video track:",
          err
        );
      }
    }
  }

  public async toggleMic(on: boolean) {
    if (!this.currentCall) return;

    console.log(`[CallService] Toggling mic: ${on}`);

    const callAny = this.currentCall as any;
    const pc = callAny.peerConn as RTCPeerConnection;
    const senders = pc?.getSenders?.();
    const audioSender = senders?.find((s) => s.track?.kind === "audio");

    if (!audioSender) {
      console.warn("[CallService] No audio sender found");
      return;
    }

    if (!on) {
      const silentTrack = createSilentAudioTrack();
      await audioSender.replaceTrack(silentTrack);
      console.log("[CallService] Mic muted using silent track");

      this.localStream?.getAudioTracks().forEach((t) => t.stop());
      const videoTracks = this.localStream?.getVideoTracks() ?? [];
      this.localStream = new MediaStream(videoTracks);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const newTrack = newStream.getAudioTracks()[0];
        await audioSender.replaceTrack(newTrack);
        console.log("[CallService] Mic unmuted");

        this.localStream?.addTrack(newTrack);
      } catch (err) {
        console.error("[CallService] Failed to unmute mic:", err);
      }
    }

    this.emit("mic-toggled", on);
  }
}

// ✅ Export singleton instance instead of creating new instance
export const callService = CallService.getInstance();

// ✅ Export the class for type checking if needed
export { CallService };

// ✅ Export helper functions
export const getCallService = () => CallService.getInstance();
export const destroyCallService = () => CallService.destroyInstance();
export const hasCallServiceInstance = () => CallService.hasInstance();
