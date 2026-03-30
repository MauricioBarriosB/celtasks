/**
 * CRUD API Service for Projects, Tasks, Admin, Dashboard
 *
 * JWT token is automatically attached by the request interceptor in apiConfig.ts
 */

import { apiClient } from "./apiConfig";
import type {
    Project,
    ProjectFormData,
    Task,
    TaskFormData,
    TaskReorderItem,
    User,
    DashboardStats,
} from "@/types";

// ================================================================
// Projects (user)
// ================================================================

export async function fetchMyProjects(): Promise<Project[]> {
    const response = await apiClient.get<{ success: boolean; data: Project[] }>("/projects");
    return response.data.data;
}

export async function fetchProject(id: number): Promise<Project> {
    const response = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return response.data.data;
}

// ================================================================
// Projects (admin)
// ================================================================

export async function fetchAllProjects(): Promise<Project[]> {
    const response = await apiClient.get<{ success: boolean; data: Project[] }>("/admin/projects");
    return response.data.data;
}

export async function createProject(data: ProjectFormData): Promise<Project> {
    const response = await apiClient.post<{ success: boolean; data: Project }>("/admin/projects", data);
    return response.data.data;
}

export async function updateProject(id: number, data: ProjectFormData): Promise<Project> {
    const response = await apiClient.put<{ success: boolean; data: Project }>(`/admin/projects/${id}`, data);
    return response.data.data;
}

export async function deleteProject(id: number): Promise<void> {
    await apiClient.delete(`/admin/projects/${id}`);
}

export async function fetchProjectUsers(projectId: number): Promise<User[]> {
    const response = await apiClient.get<{ success: boolean; data: User[] }>(`/projects/${projectId}/users`);
    return response.data.data;
}

export async function fetchAdminProjectUsers(projectId: number): Promise<User[]> {
    const response = await apiClient.get<{ success: boolean; data: User[] }>(`/admin/projects/${projectId}/users`);
    return response.data.data;
}

export async function assignProjectUsers(projectId: number, userIds: number[]): Promise<void> {
    await apiClient.post(`/admin/projects/${projectId}/users`, { userIds });
}

export async function removeProjectUser(projectId: number, userId: number): Promise<void> {
    await apiClient.delete(`/admin/projects/${projectId}/users/${userId}`);
}

// ================================================================
// Tasks
// ================================================================

export async function fetchProjectTasks(projectId: number): Promise<Task[]> {
    const response = await apiClient.get<{ success: boolean; data: Task[] }>(`/projects/${projectId}/tasks`);
    return response.data.data;
}

export async function fetchTask(id: number): Promise<Task> {
    const response = await apiClient.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return response.data.data;
}

export async function createTask(data: TaskFormData): Promise<Task> {
    const response = await apiClient.post<{ success: boolean; data: Task }>("/tasks", data);
    return response.data.data;
}

export async function updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
    const response = await apiClient.put<{ success: boolean; data: Task }>(`/tasks/${id}`, data);
    return response.data.data;
}

export async function deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
}

export async function updateTaskStatus(id: number, status: string): Promise<Task> {
    const response = await apiClient.put<{ success: boolean; data: Task }>(`/tasks/${id}/status`, { status });
    return response.data.data;
}

export async function reorderTasks(tasks: TaskReorderItem[]): Promise<void> {
    await apiClient.put("/tasks/reorder", { tasks });
}

// ================================================================
// Admin - Users
// ================================================================

export async function createUser(data: { name: string; email: string; password: string; role: string }): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User }>("/admin/users", data);
    return response.data.data;
}

export async function fetchAllUsers(params?: { search?: string; page?: number; limit?: number }): Promise<{ users: User[]; total: number }> {
    const response = await apiClient.get<{ success: boolean; data: { users: User[]; total: number } }>("/admin/users", { params });
    return response.data.data;
}

export async function fetchUser(id: number): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/admin/users/${id}`);
    return response.data.data;
}

export async function updateUser(id: number, data: { name?: string; email?: string; role?: string; password?: string }): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>(`/admin/users/${id}`, data);
    return response.data.data;
}

export async function toggleUserActive(id: number): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>(`/admin/users/${id}/toggle-active`, {});
    return response.data.data;
}

export async function deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
}

// ================================================================
// Dashboard
// ================================================================

export async function fetchDashboard(): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>("/dashboard");
    return response.data.data;
}
