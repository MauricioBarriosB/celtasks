/**
 * Authentication Context
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { User, LoginCredentials, RegisterData, ProfileUpdateData, PasswordUpdateData } from "@/types";
import {
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    getCurrentUser,
    updateProfile as apiUpdateProfile,
    updatePassword as apiUpdatePassword,
    refreshAccessToken,
    tokenStorage,
    getAuthErrorMessage,
} from "@services/apiAuth";

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    isAdmin: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
    updatePassword: (data: PasswordUpdateData) => Promise<boolean>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user && tokenStorage.isAuthenticated();
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const initAuth = async () => {
            if (tokenStorage.isAuthenticated()) {
                try {
                    const currentUser = await getCurrentUser();
                    setUser(currentUser);
                } catch {
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        setUser(refreshed.user);
                    } else {
                        setUser(null);
                    }
                }
            }
            setIsInitialized(true);
        };
        initAuth();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiLogin(credentials);
            setUser(response.user);
            return true;
        } catch (err) {
            const errorCode = (err as { code?: string })?.code || "UNKNOWN_ERROR";
            setError(getAuthErrorMessage(errorCode));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiRegister(data);
            setUser(response.user);
            return true;
        } catch (err) {
            const errorCode = (err as { code?: string })?.code || "UNKNOWN_ERROR";
            setError(getAuthErrorMessage(errorCode));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await apiLogout();
        } finally {
            setUser(null);
            setError(null);
            setIsLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedUser = await apiUpdateProfile(data);
            setUser(updatedUser);
            return true;
        } catch (err) {
            const errorCode = (err as { code?: string })?.code || "UNKNOWN_ERROR";
            setError(getAuthErrorMessage(errorCode));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updatePassword = useCallback(async (data: PasswordUpdateData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            await apiUpdatePassword(data);
            return true;
        } catch (err) {
            const errorCode = (err as { code?: string })?.code || "UNKNOWN_ERROR";
            setError(getAuthErrorMessage(errorCode));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async (): Promise<void> => {
        if (!tokenStorage.isAuthenticated()) return;
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch {
            // Silently fail
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value: AuthContextValue = useMemo(
        () => ({
            user,
            isAuthenticated,
            isLoading,
            isInitialized,
            error,
            isAdmin,
            login,
            register,
            logout,
            updateProfile,
            updatePassword,
            refreshUser,
            clearError,
        }),
        [
            user,
            isAuthenticated,
            isLoading,
            isInitialized,
            error,
            isAdmin,
            login,
            register,
            logout,
            updateProfile,
            updatePassword,
            refreshUser,
            clearError,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuthContext must be used within an AuthProvider");
    return context;
}
