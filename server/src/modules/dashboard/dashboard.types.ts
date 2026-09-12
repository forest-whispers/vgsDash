import type { TaskPriority, TaskStatus } from "@prisma/client";

export interface DashboardTask
{
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    projectId: string;
    project: {
        id: string;
        name: string;
    };
}

export interface AdminDashboard
{
    role: "ADMIN";
    projects: {
        total: number;
    };
    tasks: {
        total: number;
        byStatus: Record<TaskStatus, number>;
    };
    overdueTasks: number;
    recentActivities: unknown[];
}

export interface ProjectManagerDashboard
{
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
    recentActivities: unknown[];
}

export interface DeveloperDashboard
{
    role: "DEVELOPER";
    tasks: DashboardTask[];
    recentActivities: unknown[];
}