import { createClient, MatrixClient } from 'matrix-js-sdk';

export interface SessionData {
    accessToken: string;
    userId: string;
    deviceId: string;
    homeserverUrl: string;
    refreshToken?: string;
}

const SESSION_KEY = 'matrix_session';

// Lưu thông tin phiên đăng nhập
export const saveSession = (sessionData: SessionData): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
    } catch (error) {
        console.error('Error saving session:', error);
    }
};

// Lấy thông tin phiên đăng nhập
export const getSession = (): SessionData | null => {
    try {
        if (typeof window !== 'undefined') {
            const sessionStr = localStorage.getItem(SESSION_KEY);
            return sessionStr ? JSON.parse(sessionStr) : null;
        }
        return null;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

// Xóa phiên đăng nhập
export const clearSession = (): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_KEY);
        }
    } catch (error) {
        console.error('Error clearing session:', error);
    }
};

// Tạo Matrix client từ session đã lưu
export const createClientFromSession = (sessionData: SessionData): MatrixClient => {
    return createClient({
        baseUrl: sessionData.homeserverUrl,
        accessToken: sessionData.accessToken,
        userId: sessionData.userId,
        deviceId: sessionData.deviceId,
        refreshToken: sessionData.refreshToken,
    });
};

// Đăng nhập và lưu session
export const loginAndSaveSession = async (
    homeserverUrl: string,
    username: string,
    password: string
): Promise<MatrixClient> => {
    const tempClient = createClient({ baseUrl: homeserverUrl });
    try {
        const loginResponse = await tempClient.login('m.login.password', {
            user: username,
            password: password,
            device_id: undefined, // Để Matrix tự tạo device ID
            initial_device_display_name: 'NextJS App'
        });
        const sessionData: SessionData = {
            accessToken: loginResponse.access_token,
            userId: loginResponse.user_id,
            deviceId: loginResponse.device_id,
            homeserverUrl: homeserverUrl,
            refreshToken: loginResponse.refresh_token
        };
        saveSession(sessionData);
        const client = createClientFromSession(sessionData);
        return client;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Kiểm tra và khôi phục session
export const restoreSession = async (): Promise<MatrixClient | null> => {
    const sessionData = getSession();
    if (!sessionData) return null;
    try {
        const client = createClientFromSession(sessionData);
        // Kiểm tra token có còn hợp lệ không
        await client.whoami();
        return client;
    } catch (error) {
        console.error('Invalid session:', error);
        clearSession();
        return null;
    }
};

// Đăng xuất và xóa session
export const logoutAndClearSession = async (client: MatrixClient): Promise<void> => {
    try {
        await client.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearSession();
        client.stopClient();
    }
}; 