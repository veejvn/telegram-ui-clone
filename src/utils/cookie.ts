// src/utils/cookie.ts

// Lưu token vào cookie (với URL encoding)
export function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue}; expires=${expires}; path=/`;
    console.log(`🍪 Set cookie ${name}:`, value);
}

// Lấy token từ cookie (với URL decoding)
export function getCookie(name: string) {
    const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
    
    if (value) {
        try {
            return decodeURIComponent(value);
        } catch (error) {
            console.warn(`🍪 Failed to decode cookie ${name}:`, error);
            return value; // fallback to raw value
        }
    }
    return null;
}

// Xóa token khỏi cookie
export function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`🍪 Deleted cookie ${name}`);
} 