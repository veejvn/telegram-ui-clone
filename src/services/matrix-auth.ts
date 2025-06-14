"use client"

import * as sdk from "matrix-js-sdk"; 
import { ERROR_MESSAGES } from "@/constants/error-messages"
import { LoginFormData, RegisterFormData } from "@/types/auth";
import { getLS, removeLS, setLS } from "@/tools/localStorage.tool";

// Matrix homeserver URL - replace with your homeserver
const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";
const SERVER_URL: string = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

let clientInstance: sdk.MatrixClient | null = null;

export class MatrixAuthService {
    private client: sdk.MatrixClient

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

    async sendEmailVerification(email: string) : Promise<any> {

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
                    next_link: `${SERVER_URL}/verify-email` // URL callback sau khi verify
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
            console.error("Send email verification error:", error);
            throw error;
        }
    }

    // Đăng ký tài khoản mới
    async register({ username, password} : RegisterFormData) : Promise<any> {
        try {
            const registerResponse = await this.client.registerRequest({
                username,
                password,
                auth: {
                    type: "m.login.dummy",
                },
                initial_device_display_name: "Web Client"
            })

            if (registerResponse.access_token) {
                setLS("access_token", registerResponse.access_token);
                setLS("user_id", registerResponse.user_id);
                this.client = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: registerResponse.access_token,
                    userId: registerResponse.user_id
                });
            }
            return registerResponse;
        } catch (error) {
            console.error("Registration error:", error)
            throw error
        }
    }

    // Đăng nhập
    async login({username , password} : LoginFormData) : Promise<any> {
        try {
            const loginResponse = await this.client.loginRequest({
                type: "m.login.password",
                user: username,
                password: password,
            })
            if (loginResponse.access_token) {
                setLS("access_token", loginResponse.access_token);
                setLS("user_id", loginResponse.user_id);
                this.client = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: loginResponse.user_id
                });
                console.log("Login successful:", loginResponse);
            }
            return loginResponse;
        } catch (error) {
            console.error("Login error:", error)
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
                setLS("access_token", loginResponse.access_token);
                setLS("user_id", loginResponse.user_id);
                this.client = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: loginResponse.user_id
                });
            }

            return loginResponse
        } catch (error) {
            console.error("Login with email error:", error)
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
                setLS("access_token", loginResponse.access_token);
                setLS("user_id", loginResponse.user_id);
                this.client = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: loginResponse.user_id
                });
            }

            return loginResponse
        } catch (error) {
            console.error("Login with phone error:", error)
            throw error
        }
    }

    // Đăng xuất
    async logout() {
        try {
            const accessToken = getLS("access_token");
            const userId = getLS("user_id");
            if (!accessToken || !userId) {
                throw new Error("No access token found. Please login first.");
            }
            if (!this.client.getAccessToken()) {
                this.client = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: accessToken,
                    userId: userId
                });
            }
            await this.client.logout()
            removeLS("access_token");
            removeLS("user_id");
            clientInstance = null;
        } catch (error) {
            console.error("Logout failed:", error)
            throw error
        }
    }

    // Lấy danh sách thiết bị đang đăng nhập
    async getDevices() {
        try {
            const response = await this.client.getDevices()
            return response.devices
        } catch (error) {
            console.error("Get devices failed:", error)
            throw error
        }
    }

    // Đăng xuất một thiết bị cụ thể
    async logoutDevice(deviceId: string) {
        try {
            await this.client.deleteDevice(deviceId)
        } catch (error) {
            console.error("Logout device failed:", error)
            throw error
        }
    }

    // Quên mật khẩu
    async forgotPassword(email: string) {
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/password/email/requestToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    client_secret: Math.random().toString(36).substring(2),
                    send_attempt: 1,
                    next_link: `${window.location.origin}/auth/reset-password`
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
            }

            return data;
        } catch (error) {
            console.error("Password reset request error:", error);
            throw error;
        }
    }

    // Đặt lại mật khẩu
    async resetPassword(newPassword: string, token: string) {
        try {
            const response = await this.client.setPassword(newPassword, token)
            return response
        } catch (error) {
            console.error("Reset password failed:", error)
            throw error
        }
    }

    // Cập nhật thông tin cá nhân
    async updateProfile(displayName?: string, avatarUrl?: string) {
        try {
            if (displayName) {
                await this.client.setDisplayName(displayName)
            }
            if (avatarUrl) {
                await this.client.setAvatarUrl(avatarUrl)
            }
        } catch (error) {
            console.error("Update profile failed:", error)
            throw error
        }
    }

    // Kiểm tra trạng thái đăng nhập
    isLoggedIn() {
        return !! getLS("access_token") && !! getLS("user_id");
    }

    // Lấy thông tin người dùng hiện tại
    getCurrentUser() {
        return {
            userId: getLS("user_id"),
            token: getLS("access_token"),
        }
    }
} 