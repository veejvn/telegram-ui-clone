"use client"

import * as sdk from "matrix-js-sdk";

/**
 * Waits for the Matrix client to be ready (in "PREPARED" or "SYNCING" state).
 * Resolves immediately if already ready, otherwise waits for the sync event.
 * @param client The MatrixClient instance to monitor.
 * @returns Promise that resolves when the client is ready.
 */
export const waitForClientReady = (client: sdk.MatrixClient): Promise<void> => {
  return new Promise((resolve) => {
    const state = client.getSyncState();

    if (state === "PREPARED" || state === "SYNCING") {
      resolve();
    } else {
      const onSync = (syncState: string) => {
        if (syncState === "PREPARED" || syncState === "SYNCING") {
          client.removeListener("sync" as any, onSync);
          resolve();
        }
      };
      client.on("sync" as any, onSync);
    }
  });
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
