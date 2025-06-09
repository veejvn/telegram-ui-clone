export interface User {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface LoginResponse {
    success: boolean;
    user?: User;
    error?: string;
} 

export interface LoginFormData {
    username: string;
    password: string;
}

export interface RegisterFormData {
    username: string;
    password: string;}

