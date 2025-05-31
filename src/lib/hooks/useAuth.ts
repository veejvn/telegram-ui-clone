import { useState, useCallback } from 'react';
import { AuthService, LoginCredentials } from '../services/auth';
import { AuthState, User } from '../types/auth';

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
};

export function useAuth() {
    const [state, setState] = useState<AuthState>(initialState);
    const authService = new AuthService();

    const login = useCallback(async (credentials: LoginCredentials) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await authService.login(credentials);
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                user: response.user || null,
                loading: false,
            }));
            return response;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'An error occurred',
            }));
            throw error;
        }
    }, []);

    const logout = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            await authService.logout();
            setState(initialState);
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'An error occurred',
            }));
            throw error;
        }
    }, []);

    return {
        ...state,
        login,
        logout,
    };
} 