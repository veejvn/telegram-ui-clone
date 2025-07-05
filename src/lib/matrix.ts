"use client"

import * as sdk from "matrix-js-sdk";
import { getCookie, deleteCookie } from "@/utils/cookie";

/**
 * Waits for the Matrix client to be ready (in "PREPARED" or "SYNCING" state).
 * Resolves immediately if already ready, otherwise waits for the sync event.
 * @param client The MatrixClient instance to monitor.
 * @returns Promise that resolves when the client is ready.
 */
export const waitForClientReady = (client: sdk.MatrixClient): Promise<void> => {
  return new Promise((resolve) => {
    if (client.getSyncState() === "SYNCING") {
      resolve();
    } else {
      client.once("sync" as any, () => {
        resolve();
      });
    }
  });
};

/**
 * Checks the validity of the Matrix access token.
 * @returns Promise that resolves to true if the token is valid, false otherwise.
 */
export const checkTokenValidity = async (): Promise<boolean> => {
  const accessToken = getCookie("matrix_token");
  const userId = getCookie("matrix_user_id");

  if (!accessToken || !userId) {
    return false;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MATRIX_BASE_URL}/_matrix/client/v3/account/whoami`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

/**
 * Handles token errors by logging out the user.
 */
export const handleTokenError = () => {
  console.log("Handling token error - logging out user");
  deleteCookie("matrix_token");
  deleteCookie("matrix_user_id");
  deleteCookie("matrix_device_id");

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Creates a Matrix client instance using credentials stored in localStorage.
 *
 * This function retrieves the `access_token` and `user_id` from localStorage. If either is missing,
 * it returns `null`. Otherwise, it creates a new Matrix client instance with the provided credentials.
 *
 * @returns {sdk.MatrixClient | null} The created Matrix client instance, or `null` if credentials are missing.
 */
export const createMatrixClient = (): sdk.MatrixClient | null => {
  const accessToken = getCookie("matrix_token");
  const userId = getCookie("matrix_user_id");

  if (!accessToken || !userId) {
    return null;
  }

  try {
    const client = sdk.createClient({
      baseUrl: process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org",
      accessToken,
      userId,
    });

    // Add error handling for token issues
    client.on("sync" as any, (state: any, prevState: any, data: any) => {
      if (
        state === "ERROR" &&
        data?.error?.httpStatus &&
        [401, 403].includes(data.error.httpStatus)
      ) {
        handleTokenError();
      }
    });

    return client;
  } catch (error) {
    console.error("Error creating Matrix client:", error);
    return null;
  }
};

/**
 * Initializes and authenticates a Matrix client using credentials stored in localStorage.
 *
 * This function retrieves the `access_token` and `user_id` from localStorage. If either is missing,
 * it returns `null`. Otherwise, it creates a new Matrix client instance with the provided credentials,
 * starts the client, waits for it to be ready, and stores the client instance in the application's client store.
 *
 * @returns {Promise<typeof client | null>} The authenticated Matrix client instance, or `null` if authentication fails.
 */
// export const setupAuthedClient = async (): Promise<typeof client | null> => {
//   const authServie = new MatrixAuthService();
//   const { userId, token } = authServie.getCurrentUser();
//   const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

//   if (!token || !userId) return null;

//   const client = sdk.createClient({
//     baseUrl: HOMESERVER_URL,
//     accessToken: token,
//     userId: userId,
//   });

//   client.startClient();

//   await waitForClientReady(client);
//   useClientStore.getState().setClient(client);

//   return client;
// };
