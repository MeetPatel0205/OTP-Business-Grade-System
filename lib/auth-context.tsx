'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles?: { name: string }[];
    permissions?: { name: string }[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async (storedToken: string) => {
        try {
            // Check cache validity (5 minutes)
            const lastCheck = localStorage.getItem('auth_last_check');
            const now = Date.now();

            if (lastCheck && (now - parseInt(lastCheck)) < 5 * 60 * 1000) {
                // Cache is valid, rely on stored user
                return;
            }

            // Cache expired or missing, re-validate
            const response = await authAPI.getUser();
            const freshUser = response.data.user;

            // Update storage and state
            localStorage.setItem('user', JSON.stringify(freshUser));
            localStorage.setItem('auth_last_check', now.toString());
            setUserState(freshUser);
        } catch (error) {
            console.error('Auth validation failed:', error);
            // If API fails (401), logout
            logout();
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUserState(JSON.parse(storedUser));

                // Validate in background, don't block UI
                checkAuth(storedToken);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('auth_last_check', Date.now().toString());

        setToken(newToken);
        setUserState(newUser);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth_last_check');
            setToken(null);
            setUserState(null);
        }
    };

    const setUser = (newUser: User) => {
        localStorage.setItem('user', JSON.stringify(newUser));
        setUserState(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
