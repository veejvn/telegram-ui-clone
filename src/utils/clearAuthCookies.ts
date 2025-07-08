import { deleteCookie } from '@/utils/cookie';

/**
 * Clear all Matrix authentication cookies
 */
export function clearMatrixAuthCookies(): void {
  deleteCookie("matrix_token");
  deleteCookie("matrix_user_id");
  deleteCookie("matrix_device_id");
  deleteCookie("matrix_user");
  
  // Also clear localStorage if any Matrix data is stored there
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('matrix') || key.startsWith('mx_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Matrix authentication cookies and localStorage cleared');
  }
}

/**
 * Add this function to window for debugging purposes
 */
if (typeof window !== 'undefined') {
  (window as any).clearMatrixAuth = clearMatrixAuthCookies;
} 