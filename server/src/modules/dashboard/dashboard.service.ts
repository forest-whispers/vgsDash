import { ProjectStatus, TaskPriority, TaskStatus, UserRole } from "@prisma/client";

import { prisma } from "../../shared/config/prisma.js";
import { getActivitiesService } from "../activities/activities.service.js";
import type { AuthContext } from "../auth/auth.types.js";
import type {
    AdminDashboard,
    DeveloperDashboard,
    ProjectManagerDashboard,
} from "./dashboard.types.js";

const getWeekRange = () =>
{
    const now = new Date();

    const start = new Date(now);
    const day = start.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return {
        start,
        end,
    };
};

const getAdminDashboardService = async ( user: AuthContext ): Promise<AdminDashboard> =>
{
    const [
        totalProjects,
        totalTasks,
        taskStatusGroups,
        overdueTasks,
        recentActivities,
    ] = await Promise.all([
        prisma.project.count(),

        prisma.task.count(),

        prisma.task.groupBy({
            by: ["status"],
            _count: {
                _all: true,
            },
        }),

        prisma.task.count({
            where: {
                isOverdue: true,
            },
        }),

        getActivitiesService(user, { limit: 5 }),
    ]);

    const byStatus: Record<TaskStatus, number> = {
        TODO: 0,
        IN_PROGRESS: 0,
        IN_REVIEW: 0,
        DONE: 0,
    };

    for (const group of taskStatusGroups) {
        byStatus[group.status] = group._count._all;
    }

    return {
        role: "ADMIN",
        projects: {
            total: totalProjects,
        },
        tasks: {
            total: totalTasks,
            byStatus,
        },
        overdueTasks,
        recentActivities,
    };
};

const getProjectManagerDashboardService = async ( user: AuthContext ): Promise<ProjectManagerDashboard> =>
{
    const { start, end } = getWeekRange();

    const projectWhere = {
        managerId: user.userId,
    };

    const [
        totalProjects,
        activeProjects,
        abandonedProjects,
        taskCount,
        taskPriorityGroups,
        upcomingDueDates,
        recentActivities,
    ] = await Promise.all([
        prisma.project.count({
            where: projectWhere,
        }),

        prisma.project.count({
            where: {
                ...projectWhere,
                status: ProjectStatus.ACTIVE,
            },
        }),

        prisma.project.count({
            where: {
                ...projectWhere,
                status: ProjectStatus.ABANDONED,
            },
        }),

        prisma.task.count({
            where: {
                project: projectWhere,
            },
        }),

        prisma.task.groupBy({
            by: ["priority"],
            where: {
                project: projectWhere,
            },
            _count: {
                _all: true,
            },
        }),

        prisma.task.findMany({
            where: {
                project: projectWhere,
                dueDate: {
                    gte: start,
                    lt: end,
                },
                status: {
                    not: TaskStatus.DONE,
                },
            },
            orderBy: {
                dueDate: "asc",
            },
            take: 10,
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                projectId: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),

        getActivitiesService(user, { limit: 5 }),
    ]);

    const byPriority: Record<TaskPriority, number> = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
    };

    for (const group of taskPriorityGroups) {
        byPriority[group.priority] = group._count._all;
    }

    return {
        role: "PROJECT_MANAGER",
        projects: {
            total: totalProjects,
            active: activeProjects,
            abandoned: abandonedProjects,
        },
        tasks: {
            total: taskCount,
            byPriority,
        },
        upcomingDueDates,
        recentActivities,
    };
};

const getDeveloperDashboardService = async ( user: AuthContext ): Promise<DeveloperDashboard> =>
{
    const [tasks, recentActivities] = await Promise.all([
        prisma.task.findMany({
            where: {
                assignedDeveloperId: user.userId,
            },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                projectId: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),

        getActivitiesService(user, { limit: 5 }),
    ]);

    const priorityOrder: Record<TaskPriority, number> = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
    };

    tasks.sort((a, b) => {
        const priorityDifference =
            priorityOrder[a.priority] - priorityOrder[b.priority];

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.getTime() - b.dueDate.getTime();
    });

    return {
        role: "DEVELOPER",
        tasks,
        recentActivities,
    };
};

export const getDashboardService = async (user: AuthContext) =>
{
    switch (user.role) {
        case UserRole.ADMIN:
            return getAdminDashboardService(user);

        case UserRole.PROJECT_MANAGER:
            return getProjectManagerDashboardService(user);

        case UserRole.DEVELOPER:
            return getDeveloperDashboardService(user);
    }
};