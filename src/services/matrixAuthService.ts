"use client"

import * as sdk from "@/lib/matrix-sdk";
import { ERROR_MESSAGES } from "@/constants/error-messages"
import { LoginFormData, RegisterFormData } from "@/types/auth";
import { ILoginResponse } from "@/types/matrix";
import { useUserStore } from "@/stores/useUserStore";
import { normalizeMatrixUserId } from "@/utils/matrixHelpers";
import { deleteCookie, getCookie } from "@/utils/cookie";

// Kiểm tra env variables bắt buộc
if (!process.env.NEXT_PUBLIC_MATRIX_BASE_URL) {
    throw new Error("NEXT_PUBLIC_MATRIX_BASE_URL is required");
}
if (!process.env.NEXT_PUBLIC_BASE_APP_URL) {
    throw new Error("NEXT_PUBLIC_SERVER_URL is required");
}

const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL;
const SERVER_URL: string = process.env.NEXT_PUBLIC_BASE_APP_URL;

let clientInstance: sdk.MatrixClient | null = null;

const clearUser = useUserStore.getState().clearUser

export class MatrixAuthService {
    public client: sdk.MatrixClient

    constructor() {
        if (typeof window === 'undefined') {
            throw new Error(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR)
        }
        if (!clientInstance) {
            clientInstance = sdk.createClient({
                baseUrl: HOMESERVER_URL,
            })
        }
        this.client = clientInstance
    }

    async sendEmailVerification(email: string): Promise<any> {
        const clientSecret = Math.random().toString(36).substring(2, 10);
        const sendAttempt = 1;
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/register/email/requestToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_secret: clientSecret,
                    email: email,
                    send_attempt: sendAttempt,
                    next_link: `${SERVER_URL}/verify-email`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send verification email');
            }

            return {
                sid: data.sid,
                client_secret: clientSecret
            };
        } catch (error) {
            throw error;
        }
    }

    // Đăng ký tài khoản mới
    async register({ username, password }: RegisterFormData): Promise<any> {
        try {
            const registerResponse = await this.client.registerRequest({
                username,
                password,
                auth: {
                    type: "m.login.dummy",
                },
                initial_device_display_name: "Web Client"
            });
            
            if (registerResponse.access_token) {
                const normalizedUserId = normalizeMatrixUserId(registerResponse.user_id, HOMESERVER_URL);
                
                // setCookie("matrix_token", registerResponse.access_token);
                // setCookie("matrix_user_id", normalizedUserId);
                // if (registerResponse.device_id) {
                //     setCookie("matrix_device_id", registerResponse.device_id);
                // }
                clientInstance = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: registerResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: registerResponse.device_id
                });
                
                return {
                    success: true,
                    token: registerResponse.access_token,
                    userId: normalizedUserId
                };
            }
            
            throw new Error("Registration failed: No access token received");
        } catch (error) {
            throw error;
        }
    }

    // Đăng nhập
    async login({ username, password }: LoginFormData): Promise<ILoginResponse> {
        try {
            const loginResponse = await this.client.loginRequest({
                type: "m.login.password",
                user: username,
                password: password,
            })
            
            if (loginResponse.access_token && loginResponse.user_id && loginResponse.device_id) {
                const normalizedUserId = normalizeMatrixUserId(loginResponse.user_id, HOMESERVER_URL);
                
                // setCookie("matrix_token", loginResponse.access_token);
                // setCookie("matrix_user_id", normalizedUserId);
                // if (loginResponse.device_id) {
                //     setCookie("matrix_device_id", loginResponse.device_id);
                // }
                const res = await fetch("/chat/api/set-cookie", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      token: loginResponse.access_token,
                      userId: normalizedUserId,
                      deviceId: loginResponse.device_id
                    }),
                    credentials: "include" // 👈 đảm bảo cookie được gửi kèm trong các request sau
                });
                console.log(res)
                if(!res.ok) 
                    return{
                        success: false,
                        token: "",
                        userId: "",
                        deviceId: ""
                    }
                clientInstance = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: loginResponse.device_id
                });
                
                return {
                    success: true,
                    token: loginResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: loginResponse.device_id
                };
            }
            
            throw new Error("Login failed: No access token received");
        } catch (error: any) {
            throw error
        }
    }

    // Đăng nhập bằng email
    async loginWithEmail(email: string, password: string) {
        try {
            const loginResponse = await this.client.login("m.login.password", {
                identifier: {
                    type: "m.id.thirdparty",
                    medium: "email",
                    address: email,
                },
                password: password,
            })

            if (loginResponse.access_token) {
                const normalizedUserId = normalizeMatrixUserId(loginResponse.user_id, HOMESERVER_URL);
                
                // setCookie("matrix_token", loginResponse.access_token);
                // setCookie("matrix_user_id", normalizedUserId);
                // if (loginResponse.device_id) {
                //     setCookie("matrix_device_id", loginResponse.device_id);
                // }
                clientInstance = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: loginResponse.device_id,
                });
                
                this.client = clientInstance;
                
                return {
                    success: true,
                    token: loginResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: loginResponse.device_id
                };
            }

            throw new Error("Login with email failed: No access token received");
        } catch (error) {
            throw error
        }
    }

    // Đăng nhập bằng số điện thoại
    async loginWithPhone(phone: string, password: string) {
        try {
            const loginResponse = await this.client.login("m.login.password", {
                identifier: {
                    type: "m.id.phone",
                    country: "VN",
                    phone: phone,
                },
                password: password,
            })

            if (loginResponse.access_token) {
                const normalizedUserId = normalizeMatrixUserId(loginResponse.user_id, HOMESERVER_URL);
                
                // setCookie("matrix_token", loginResponse.access_token);
                // setCookie("matrix_user_id", normalizedUserId);
                // if (loginResponse.device_id) {
                //     setCookie("matrix_device_id", loginResponse.device_id);
                // }
                clientInstance = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: loginResponse.device_id,
                });
                
                this.client = clientInstance;
                
                return {
                    success: true,
                    token: loginResponse.access_token,
                    userId: normalizedUserId,
                    deviceId: loginResponse.device_id
                };
            }

            throw new Error("Login with phone failed: No access token received");
        } catch (error) {
            throw error
        }
    }

    // Đăng xuất
    async logout(): Promise<void> {
        try {
            const accessToken = getCookie("matrix_token");
            const userId = getCookie("matrix_user_id");
            if (accessToken && userId) {
                if (!this.client.getAccessToken()) {
                    this.client = sdk.createClient({
                        baseUrl: HOMESERVER_URL,
                        accessToken: accessToken,
                        userId: userId
                    });
                }
                await this.client.logout();
            }
        } catch (error) {
            // KHÔNG throw error ở đây!
        } finally {
            // Luôn xóa cookie và clear state
            deleteCookie("matrix_token");
            deleteCookie("matrix_user_id");
            deleteCookie("matrix_device_id");
            clearUser();
            if (this.client) {
                this.client.stopClient();
            }
            clientInstance = null;
        }
    }

    // Lấy danh sách thiết bị đang đăng nhập
    async getDevices() {
        try {
            return await this.client.getDevices();
        } catch (error) {
            throw error;
        }
    }

    // Đăng xuất một thiết bị cụ thể
    async logoutDevice(deviceId: string) {
        try {
            return await this.client.deleteDevice(deviceId);
        } catch (error) {
            throw error;
        }
    }

    // Quên mật khẩu
    async forgotPassword(email: string) {
        const clientSecret = Math.random().toString(36).substring(2, 10);
        const sendAttempt = 1;
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/password/email/requestToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_secret: clientSecret,
                    email: email,
                    send_attempt: sendAttempt,
                    next_link: `${SERVER_URL}/forgot-password`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send password reset email');
            }

            return {
                sid: data.sid,
                client_secret: clientSecret
            };
        } catch (error) {
            throw error;
        }
    }

    // Đặt lại mật khẩu
    async resetPassword(newPassword: string, opts: { sid: string, client_secret: string, code: string, email: string }) {
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    auth: {
                        type: "m.login.email.identity",
                        threepid_creds: {
                            sid: opts.sid,
                            client_secret: opts.client_secret,
                            id_server: "matrix.org",
                            id_access_token: opts.code
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reset password');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
} 