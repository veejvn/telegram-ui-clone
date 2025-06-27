"use client"

import * as sdk from "matrix-js-sdk";
import { ERROR_MESSAGES } from "@/constants/error-messages"
import { LoginFormData, RegisterFormData } from "@/types/auth";
import { getLS, removeLS, setLS } from "@/tools/localStorage.tool";
import { ILoginResponse } from "@/types/matrix";
import { useUserStore } from "@/stores/useUserStore";

const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";
const SERVER_URL: string = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

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
                setLS("matrix_access_token", registerResponse.access_token);
                setLS("matrix_user_id", registerResponse.user_id);
                setLS("matrix_device_id", registerResponse.device_id);
                clientInstance = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: registerResponse.access_token,
                    userId: registerResponse.user_id,
                    deviceId: registerResponse.device_id
                });
            }
            return {
                success: true,
                token: registerResponse.access_token,
                userId: registerResponse.user_id
            };
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
            if (loginResponse.access_token) {
                setLS("matrix_access_token", loginResponse.access_token);
                setLS("matrix_user_id", loginResponse.user_id);
                setLS("matrix_device_id", loginResponse.device_id);
                clientInstance = sdk.createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: loginResponse.access_token,
                    userId: loginResponse.user_id,
                    deviceId: loginResponse.device_id
                });
            }
            return {
                success: true,
                token: loginResponse.access_token,
                userId: loginResponse.user_id,
                deviceId: loginResponse.device_id
            };
        } catch (error: any) {
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
                setLS("matrix_access_token", loginResponse.access_token);
                setLS("matrix_user_id", loginResponse.user_id);
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
                setLS("matrix_access_token", loginResponse.access_token);
                setLS("matrix_user_id", loginResponse.user_id);
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
    async logout(): Promise<void> {
        try {
            const accessToken = getLS("matrix_access_token");
            const userId = getLS("matrix_user_id");
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
            removeLS("matrix_access_token");
            removeLS("matrix_user_id");
            removeLS("matrix_device_id");
            clearUser();
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
    async resetPassword(newPassword: string, opts: { sid: string, client_secret: string, code: string, email: string }) {
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    auth: {
                        type: 'm.login.email.identity',
                        threepid_creds: {
                            sid: opts.sid,
                            client_secret: opts.client_secret,
                        },
                        // session: opts.session, // Nếu server yêu cầu
                    },
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }
            return data;
        } catch (error) {
            console.error("Reset password failed:", error);
            throw error;
        }
    }
} 