import cron from "node-cron";
import { NotificationType, TaskStatus } from "@prisma/client";

import { prisma } from "../shared/config/prisma.js";
import { createNotificationService, getUnreadCountService } from "../modules/notifications/notifications.service.js";
import { emitNotification, emitUnreadCount } from "../socket/events.js";

export const processOverdueTasks = async () => {
    try {
        const now = new Date();

        // 1. Find tasks that have dueDate < now, status != DONE, and isOverdue = false
        const candidateTasks = await prisma.task.findMany({
            where: {
                dueDate: {
                    not: null,
                    lt: now,
                },
                status: {
                    not: TaskStatus.DONE,
                },
                isOverdue: false,
            },
            select: {
                id: true,
                title: true,
                projectId: true,
                assignedDeveloperId: true,
                project: {
                    select: {
                        name: true,
                        managerId: true,
                    },
                },
            },
        });

        if (candidateTasks.length === 0) {
            return;
        }

        for (const task of candidateTasks) {
            try {
                // Determine recipients: assigned Developer and Project Manager (no duplicates, only if existing)
                const recipientIds = new Set<string>();
                if (task.assignedDeveloperId) {
                    recipientIds.add(task.assignedDeveloperId);
                }
                if (task.project?.managerId) {
                    recipientIds.add(task.project.managerId);
                }

                // 2. Perform DB mutations transactionally for this task
                const result = await prisma.$transaction(async (tx) => {
                    // Update isOverdue = true
                    const updatedTask = await tx.task.update({
                        where: { id: task.id },
                        data: { isOverdue: true },
                    });

                    // Create notifications for each recipient
                    const createdNotifications = [];
                    for (const recipientId of recipientIds) {
                        const notification = await createNotificationService(tx, {
                            type: NotificationType.TASK_OVERDUE,
                            recipientId,
                            projectId: task.projectId,
                            taskId: task.id,
                            metadata: {
                                taskTitle: task.title,
                                projectName: task.project?.name,
                            },
                        });
                        createdNotifications.push({ recipientId, notification });
                    }

                    return { updatedTask, createdNotifications };
                });

                // 3. After transaction successfully commits, deliver realtime events
                for (const { recipientId, notification } of result.createdNotifications) {
                    try {
                        emitNotification(recipientId, notification);

                        const unreadCount = await getUnreadCountService({
                            userId: recipientId,
                            role: "DEVELOPER" as any, // getUnreadCountService only uses user.userId
                        });
                        emitUnreadCount(recipientId, unreadCount);
                    } catch (emitError) {
                        console.error(
                            `Failed to emit realtime notification for overdue task ${task.id} to user ${recipientId}:`,
                            emitError
                        );
                    }
                }
            } catch (taskError) {
                console.error(`Error processing overdue status for task ${task.id}:`, taskError);
            }
        }
    } catch (cronError) {
        console.error("Error running overdue task cron:", cronError);
    }
};

export const startOverdueTaskCron = () => {
    return cron.schedule(
        "* * * * *",
        async () => {
            await processOverdueTasks();
        },
        {
            noOverlap: true,
        }
    );
};
