// ================================================================
// User Types
// ================================================================

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
    avatar: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    appCode: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface ProfileUpdateData {
    name?: string;
    email?: string;
}

export interface PasswordUpdateData {
    currentPassword: string;
    newPassword: string;
}

// ================================================================
// Project Status Config
// ================================================================

export type ProjectStatus = "active" | "archived" | "completed";

export const PROJECT_STATUS_OPTIONS: { key: ProjectStatus; label: string; color: string }[] = [
    { key: "active", label: "Active", color: "success" },
    { key: "archived", label: "Archived", color: "warning" },
    { key: "completed", label: "Completed", color: "primary" },
];

export const PROJECT_STATUS_COLOR_MAP: Record<ProjectStatus, "success" | "warning" | "primary"> = {
    active: "success",
    archived: "warning",
    completed: "primary",
};

// ================================================================
// Project Types
// ================================================================

export interface Project {
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdBy: number;
    creatorName: string;
    totalHhs: number;
    totalCost: number;
    dateStart: string | null;
    dateEnd: string | null;
    createdAt: string;
    updatedAt: string;
    userCount?: number;
    taskCount?: number;
}

export interface ProjectFormData {
    name: string;
    description?: string;
    status?: string;
    totalHhs?: number;
    totalCost?: number;
    dateStart?: string | null;
    dateEnd?: string | null;
}

// ================================================================
// Task Types
// ================================================================

export type TaskStatus = "backlog" | "in_progress" | "rev_qa" | "in_production" | "finished";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskAssignee {
    id: number;
    name: string;
    email: string;
}

export interface Task {
    id: number;
    taskCode: string | null;
    projectId: number;
    projectName?: string;
    assignees: TaskAssignee[];
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    position: number;
    dateStart: string | null;
    dateEnd: string | null;
    hhTask: number;
    costTask: number;
    createdBy: number;
    creatorName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskFormData {
    projectId: number;
    title: string;
    description?: string;
    assignees?: number[];
    priority?: TaskPriority;
    dateStart?: string | null;
    dateEnd?: string | null;
    hhTask?: number;
    costTask?: number;
    status?: TaskStatus;
}

export interface TaskReorderItem {
    id: number;
    position: number;
    status: TaskStatus;
}

// ================================================================
// Dashboard Types
// ================================================================

export interface DashboardStats {
    tasksByStatus: Record<TaskStatus, number>;
    totalProjects: number;
    totalTasks: number;
    recentTasks: Task[];
}

// ================================================================
// Kanban Column Config
// ================================================================

export const KANBAN_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
    { key: "backlog", label: "Backlog", color: "default" },
    { key: "in_progress", label: "In Progress", color: "primary" },
    { key: "rev_qa", label: "Rev QA", color: "warning" },
    { key: "finished", label: "Finished", color: "success" },
    { key: "in_production", label: "In Production", color: "secondary" },
];

export const PRIORITY_COLOR_MAP: Record<TaskPriority, "default" | "primary" | "warning" | "danger"> = {
    low: "default",
    medium: "primary",
    high: "warning",
    urgent: "danger",
};

export const PRIORITY_OPTIONS: { key: TaskPriority; label: string; color: string }[] = [
    { key: "low", label: "Low", color: "default" },
    { key: "medium", label: "Medium", color: "primary" },
    { key: "high", label: "High", color: "warning" },
    { key: "urgent", label: "Urgent", color: "danger" },
];
