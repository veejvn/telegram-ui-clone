/**
 * Central wrapper for matrix-js-sdk to avoid multiple entrypoints
 */

// Single import point for all matrix-js-sdk exports
export * from "matrix-js-sdk";
import * as sdk from "matrix-js-sdk";

// Export the default SDK object
export default sdk;

// Re-export commonly used types and classes
export type {
  MatrixClient,
  MatrixEvent,
  Room,
  RoomMember,
  LoginResponse,
  ICreateClientOpts,
  ICreateRoomOpts,
  IInvite3PID,
  ISendEventResponse,
  IRequestMsisdnTokenResponse,
  IRequestTokenResponse,
  MatrixCall,
} from "matrix-js-sdk";

// Export the createClient function directly
export const { createClient } = sdk; 