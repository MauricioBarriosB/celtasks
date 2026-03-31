/**
 * Authentication API Service
 */

import { apiClient, API_ERROR_CODES } from "./apiConfig";
import type { User, LoginCredentials, RegisterData, AuthResponse, ProfileUpdateData, PasswordUpdateData } from "@/types";

const STORAGE_KEYS = {
    ACCESS_TOKEN: import.meta.env.VITE_APP_ACCESS_TOKEN,
    REFRESH_TOKEN: import.meta.env.VITE_APP_REFRESH_TOKEN,
    USER: import.meta.env.VITE_APP_USER,
} as const;

export const AUTH_ERROR_CODES = {
    ...API_ERROR_CODES,
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    USER_EXISTS: "USER_EXISTS",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    INVALID_TOKEN: "INVALID_TOKEN",
    TOKEN_MISSING: "TOKEN_MISSING",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
    PASSWORD_MISMATCH: "PASSWORD_MISMATCH",
} as const;

export interface AuthError {
    code: string;
    message: string;
    userMessage: string;
}

export const tokenStorage = {
    getAccessToken: (): string | null => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),

    getRefreshToken: (): string | null => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),

    getUser: (): User | null => {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    },

    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    },

    setUser: (user: User): void => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    clearAll: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    isAuthenticated: (): boolean => !!tokenStorage.getAccessToken(),
};

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>("/auth/login", credentials);
    if (!response.data.success) throw createAuthError("INVALID_CREDENTIALS", "Login failed");

    const { user, accessToken, refreshToken, expiresIn } = response.data.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUser(user);
    return { user, accessToken, refreshToken, expiresIn };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>("/auth/register", data);
    if (!response.data.success) throw createAuthError("USER_EXISTS", "Registration failed");

    const { user, accessToken, refreshToken, expiresIn } = response.data.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    tokenStorage.setUser(user);
    return { user, accessToken, refreshToken, expiresIn };
}

export async function refreshAccessToken(): Promise<AuthResponse | null> {
    const refreshToken = tokenStorage.getRefreshToken();
    const user = tokenStorage.getUser();
    if (!refreshToken || !user) return null;

    try {
        const response = await apiClient.post<{ success: boolean; data: AuthResponse }>("/auth/refresh", {
            refreshToken,
            userId: user.id,
        });
        if (!response.data.success) {
            tokenStorage.clearAll();
            return null;
        }
        const { user: updatedUser, accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
        tokenStorage.setTokens(accessToken, newRefreshToken);
        tokenStorage.setUser(updatedUser);
        return { user: updatedUser, accessToken, refreshToken: newRefreshToken, expiresIn };
    } catch {
        tokenStorage.clearAll();
        return null;
    }
}

export async function logout(): Promise<void> {
    const user = tokenStorage.getUser();
    try {
        if (user) await apiClient.post("/auth/logout", { userId: user.id });
    } catch {
        // Ignore
    } finally {
        tokenStorage.clearAll();
    }
}

export async function getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>("/auth/me", {
            });
    if (!response.data.success) throw createAuthError("USER_NOT_FOUND", "Failed to get user profile");
    const user = response.data.data;
    tokenStorage.setUser(user);
    return user;
}

export async function updateProfile(data: ProfileUpdateData): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>("/auth/profile", data, {
            });
    if (!response.data.success) throw createAuthError("USER_EXISTS", "Failed to update profile");
    const user = response.data.data;
    tokenStorage.setUser(user);
    return user;
}

export async function updatePassword(data: PasswordUpdateData): Promise<void> {
    const response = await apiClient.put<{ success: boolean }>("/auth/password", data, {
            });
    if (!response.data.success) throw createAuthError("PASSWORD_MISMATCH", "Failed to update password");
}

function createAuthError(code: string, defaultMessage: string): AuthError {
    return { code, message: defaultMessage, userMessage: getAuthErrorMessage(code) };
}

export function getAuthErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
        USER_EXISTS: "An account with this email already exists.",
        USER_NOT_FOUND: "User not found.",
        INVALID_TOKEN: "Your session is invalid. Please log in again.",
        TOKEN_MISSING: "Please log in to continue.",
        TOKEN_EXPIRED: "Your session has expired. Please log in again.",
        ACCOUNT_INACTIVE: "Your account is inactive. Please contact an admin.",
        PASSWORD_MISMATCH: "The current password you entered is incorrect.",
        VALIDATION_ERROR: "Please check your input and try again.",
    };
    return messages[code] || "An unexpected error occurred.";
}
