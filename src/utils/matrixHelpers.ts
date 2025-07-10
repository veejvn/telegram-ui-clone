/**
 * Utility functions for Matrix User ID handling
 */

/**
 * Normalize Matrix User ID to ensure it has correct format @username:domain
 * @param userId - Raw user ID (might be missing domain)
 * @param homeserverUrl - Homeserver URL to extract domain from
 * @returns Properly formatted User ID
 */
export function normalizeMatrixUserId(userId: string, homeserverUrl: string): string {
  if (!userId) return '';
  
  // If userId already has correct format @username:domain, return as-is
  if (userId.includes(':') && userId.startsWith('@')) {
    return userId;
  }
  
  // Extract domain from homeserver URL
  let domain: string;
  try {
    const url = new URL(homeserverUrl);
    domain = url.hostname;
  } catch {
    // Fallback if URL parsing fails
    domain = homeserverUrl.replace(/^https?:\/\//, '').split('/')[0];
  }
  
  // Ensure userId starts with @
  const cleanUserId = userId.startsWith('@') ? userId : `@${userId}`;
  
  // Add domain if missing
  if (!cleanUserId.includes(':')) {
    return `${cleanUserId}:${domain}`;
  }
  
  return cleanUserId;
}

/**
 * Validate if a Matrix User ID has correct format
 * @param userId - User ID to validate
 * @returns true if valid format
 */
export function isValidMatrixUserId(userId: string): boolean {
  if (!userId) return false;
  
  // Matrix User ID format: @localname:domain
  const matrixUserIdRegex = /^@[a-zA-Z0-9._=-]+:[a-zA-Z0-9.-]+$/;
  return matrixUserIdRegex.test(userId);
}

/**
 * Extract username from Matrix User ID
 * @param userId - Full Matrix User ID (@username:domain)
 * @returns Username without @ and domain
 */
export function extractUsernameFromMatrixId(userId: string): string {
  if (!userId) return '';
  
  return userId.replace('@', '').split(':')[0];
}

/**
 * Extract domain from Matrix User ID
 * @param userId - Full Matrix User ID (@username:domain)
 * @returns Domain part
 */
export function extractDomainFromMatrixId(userId: string): string {
  if (!userId || !userId.includes(':')) return '';
  
  return userId.split(':')[1];
} 