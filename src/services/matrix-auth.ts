"use client"

import { MatrixClient, createClient} from "matrix-js-sdk"; 
import { ERROR_MESSAGES } from "@/constants/error-messages"
import { LoginFormData, RegisterFormData } from "@/types/auth";
import { setLS } from "@/tools/localStorage.tool";

// Matrix homeserver URL - replace with your homeserver
const HOMESERVER_URL: string = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";
const SERVER_URL: string = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

let clientInstance: MatrixClient | null = null;

export class MatrixAuthService {
    private client: MatrixClient

    constructor() {
        if (typeof window === 'undefined') {
            throw new Error(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR)
        }

        if (!clientInstance) {
            clientInstance = createClient({
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
    async register({ username, password, email} : RegisterFormData) : Promise<any> {
        try {

            //Gửi yêu cầu xác thực email
            const emailResponse = await this.sendEmailVerification(email);
            const { sid, client_secret } = emailResponse;

            const registerResponse = await this.client.registerRequest({
                username,
                password,
                auth: {
                    type: "m.login.email.identity",
                    threepid_creds: {
                        sid: sid,
                        client_secret: client_secret,
                    }
                },
                initial_device_display_name: "Web Client"
            })

            if (registerResponse.access_token) {
                setLS("access_token", registerResponse.access_token);
                setLS("user_id", registerResponse.user_id);
                this.client = createClient({
                    baseUrl: HOMESERVER_URL,
                    accessToken: registerResponse.access_token,
                    userId: registerResponse.user_id
                });
            }
        } catch (error) {
            console.error("Registration error:", error)
            throw error
        }
    }

    // Đăng nhập
    async login({username , password} : LoginFormData) : Promise<any> {
        try {
            const response = await this.client.loginRequest({
                type: "m.login.password",
                user: username,
                password: password,
            })
            return response
        } catch (error) {
            console.error("Login error:", error)
            throw error
        }
    }

    // Đăng nhập bằng email
    async loginWithEmail(email: string, password: string) {
        try {
            const response = await this.client.login("m.login.password", {
                identifier: {
                    type: "m.id.thirdparty",
                    medium: "email",
                    address: email,
                },
                password: password,
            })

            localStorage.setItem("matrix_token", response.access_token)
            localStorage.setItem("matrix_user_id", response.user_id)

            return response
        } catch (error) {
            console.error("Login with email error:", error)
            throw error
        }
    }

    // Đăng nhập bằng số điện thoại
    async loginWithPhone(phone: string, password: string) {
        try {
            const response = await this.client.login("m.login.password", {
                identifier: {
                    type: "m.id.phone",
                    country: "VN",
                    phone: phone,
                },
                password: password,
            })

            localStorage.setItem("matrix_token", response.access_token)
            localStorage.setItem("matrix_user_id", response.user_id)

            return response
        } catch (error) {
            console.error("Login with phone error:", error)
            throw error
        }
    }

    // Đăng xuất
    async logout() {
        try {
            await this.client.logout()
            localStorage.removeItem("matrix_token")
            localStorage.removeItem("matrix_user_id")
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
        return !!localStorage.getItem("matrix_token")
    }

    // Lấy thông tin người dùng hiện tại
    getCurrentUser() {
        return {
            userId: localStorage.getItem("matrix_user_id"),
            token: localStorage.getItem("matrix_token")
        }
    }
} 