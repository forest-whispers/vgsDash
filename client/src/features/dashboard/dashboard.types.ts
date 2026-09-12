import type { Activity } from "../activities/activities.types";
import type { TaskPriority, TaskStatus } from "../tasks/tasks.types";

export interface DashboardTask {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    projectId: string;
    project: {
        id: string;
        name: string;
    };
}

export interface AdminDashboardData {
    role: "ADMIN";
    projects: {
        total: number;
    };
    tasks: {
        total: number;
        byStatus: Record<TaskStatus, number>;
    };
    overdueTasks: number;
    recentActivities: Activity[];
}

export interface ProjectManagerDashboardData {
    role: "PROJECT_MANAGER";
    projects: {
        total: number;
        active: number;
        abandoned: number;
    };
    tasks: {
        total: number;
        byPriority: Record<TaskPriority, number>;
    };
    upcomingDueDates: DashboardTask[];
    recentActivities: Activity[];
}

export interface DeveloperDashboardData {
    role: "DEVELOPER";
    tasks: DashboardTask[];
    recentActivities: Activity[];
}

export type DashboardData =
    | AdminDashboardData
    | ProjectManagerDashboardData
    | DeveloperDashboardData;

export interface DashboardResponse {
    dashboard: DashboardData;
}
