"use client"

import { createClient, MatrixClient } from "matrix-js-sdk"

// Matrix homeserver URL - replace with your homeserver
const HOMESERVER_URL = "https://matrix.org"

export class MatrixAuthService {
    private client: MatrixClient

    constructor() {
        if (typeof window === 'undefined') {
            throw new Error('MatrixAuthService can only be used in client components')
        }

        this.client = createClient({
            baseUrl: HOMESERVER_URL,
        })
    }

    // Đăng ký tài khoản mới
    async register(username: string, password: string, email?: string, phone?: string) {
        try {
            const response = await this.client.register(
                username,
                password,
                null,
                {
                    auth: {
                        type: "m.login.dummy"
                    },
                    ...(email && {
                        bind_email: true,
                        email: email
                    }),
                    ...(phone && {
                        bind_msisdn: true,
                        phone_country: "VN",
                        phone_number: phone
                    })
                }
            )

            // Nếu đăng ký thành công, tự động đăng nhập
            if (response.access_token) {
                localStorage.setItem("matrix_token", response.access_token)
                localStorage.setItem("matrix_user_id", response.user_id)
            }

            return response
        } catch (error) {
            console.error("Registration error:", error)
            throw error
        }
    }

    // Đăng nhập
    async login(username: string, password: string) {
        try {
            const response = await this.client.login("m.login.password", {
                user: username,
                password: password,
            })

            localStorage.setItem("matrix_token", response.access_token)
            localStorage.setItem("matrix_user_id", response.user_id)

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

    // Bật/tắt 2FA
    async toggle2FA(enabled: boolean) {
        try {
            if (enabled) {
                // Tạo secret key cho 2FA
                const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/2fa/generate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("matrix_token")}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                return data;
            } else {
                // Tắt 2FA
                await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/2fa/disable`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("matrix_token")}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error("Toggle 2FA failed:", error)
            throw error
        }
    }

    // Xác minh thiết bị
    async verifyDevice(deviceId: string, code: string) {
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/device/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("matrix_token")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_id: deviceId,
                    code: code
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Verify device failed:", error)
            throw error
        }
    }

    // Quên mật khẩu - Gửi email reset
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
                throw new Error(data.error || 'Failed to request password reset');
            }

            return data;
        } catch (error) {
            console.error("Password reset request error:", error);
            throw error;
        }
    }

    // Reset mật khẩu
    async resetPassword(newPassword: string, token: string) {
        try {
            const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    auth: {
                        type: 'm.login.email.identity',
                        token: token,
                        session: token
                    }
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

    // Cập nhật quyền riêng tư
    async updatePrivacySettings(settings: {
        whoCanSeeMyProfile?: 'everyone' | 'contacts' | 'nobody',
        whoCanMessageMe?: 'everyone' | 'contacts' | 'nobody',
        whoCanAddMeToGroups?: 'everyone' | 'contacts' | 'nobody'
    }) {
        try {
            await this.client.setAccountData('m.privacy', settings)
        } catch (error) {
            console.error("Update privacy settings failed:", error)
            throw error
        }
    }

    // Chặn người dùng
    async blockUser(userId: string) {
        try {
            await this.client.setIgnoredUsers([userId])
        } catch (error) {
            console.error("Block user failed:", error)
            throw error
        }
    }

    // Bỏ chặn người dùng
    async unblockUser(userId: string) {
        try {
            const ignoredUsers = await this.client.getIgnoredUsers()
            const newIgnoredUsers = ignoredUsers.filter(id => id !== userId)
            await this.client.setIgnoredUsers(newIgnoredUsers)
        } catch (error) {
            console.error("Unblock user failed:", error)
            throw error
        }
    }

    // Lấy danh sách người dùng đã chặn
    async getBlockedUsers() {
        try {
            return await this.client.getIgnoredUsers()
        } catch (error) {
            console.error("Get blocked users failed:", error)
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