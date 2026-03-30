/**
 * API Client Configuration
 */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const API_ERROR_CODES = {
    AUTH_MISSING: "AUTH_MISSING",
    AUTH_EXPIRED: "AUTH_EXPIRED",
    AUTH_INVALID: "AUTH_INVALID",
    TOKEN_MISSING: "TOKEN_MISSING",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    TOKEN_INVALID: "TOKEN_INVALID",
    NOT_FOUND: "NOT_FOUND",
    METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
    SERVER_ERROR: "SERVER_ERROR",
    NETWORK_ERROR: "NETWORK_ERROR",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiError {
    code: ApiErrorCode;
    message: string;
    userMessage: string;
    timestamp?: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: boolean;
    code?: string;
    message?: string;
    userMessage?: string;
}

type ErrorListener = (error: ApiError) => void;
const errorListeners: Set<ErrorListener> = new Set();

export function onApiError(listener: ErrorListener): () => void {
    errorListeners.add(listener);
    return () => errorListeners.delete(listener);
}

function notifyError(error: ApiError): void {
    errorListeners.forEach((listener) => {
        try {
            listener(error);
        } catch (e) {
            console.error("Error in API error listener:", e);
        }
    });
}

function createApiError(code: ApiErrorCode, message: string, userMessage: string): ApiError {
    return { code, message, userMessage, timestamp: Date.now() };
}

/**
 * Token storage keys (read from env)
 */
const ACCESS_TOKEN_KEY = import.meta.env.VITE_APP_ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = import.meta.env.VITE_APP_REFRESH_TOKEN;
const USER_KEY = import.meta.env.VITE_APP_USER;

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
});

/**
 * Request interceptor - automatically attach JWT token to every request
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
    },
    (error: Error) => Promise.reject(error),
);

/**
 * Response interceptor - handle errors and auto-logout on expired token
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiResponse<unknown>>) => {
        let apiError: ApiError;

        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || !error.response) {
            apiError = createApiError(
                API_ERROR_CODES.NETWORK_ERROR,
                "Network error: Unable to connect to API",
                "Unable to connect to the server. Please check your connection.",
            );
        } else {
            const responseData = error.response.data;
            const errorCode = (responseData?.code as ApiErrorCode) || API_ERROR_CODES.UNKNOWN_ERROR;
            apiError = createApiError(
                errorCode,
                responseData?.message || `API error: ${error.response.status}`,
                responseData?.userMessage || "An error occurred. Please try again.",
            );

            // Auto-logout on expired/invalid token
            if (errorCode === "TOKEN_EXPIRED" || errorCode === "TOKEN_INVALID") {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                window.location.href = "/celtasks/login";
            }
        }

        notifyError(apiError);
        return Promise.reject(apiError);
    },
);

export function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "userMessage" in error) {
        return (error as ApiError).userMessage;
    }
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred.";
}
