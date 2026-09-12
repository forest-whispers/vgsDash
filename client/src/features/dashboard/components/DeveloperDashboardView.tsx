import { Link } from "react-router-dom";
import type { DeveloperDashboardData } from "../dashboard.types";
import TaskPriorityBadge from "../../tasks/components/TaskPriorityBadge";
import TaskStatusBadge from "../../tasks/components/TaskStatusBadge";
import DashboardActivityList from "./DashboardActivityList";
import EmptyState from "../../../shared/ui/EmptyState";

interface DeveloperDashboardViewProps {
    dashboard: DeveloperDashboardData;
}

export default function DeveloperDashboardView({
    dashboard,
}: DeveloperDashboardViewProps) {
    const { tasks, recentActivities } = dashboard;

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Summary Card */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Assigned Tasks
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                            {tasks.length}
                        </span>
                        <Link
                            to="/tasks"
                            className="text-xs font-medium text-blue-600 hover:underline"
                        >
                            Go to My Tasks &rarr;
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        In Progress
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-blue-600">
                            {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                        </span>
                        <span className="text-xs text-gray-500">Active tasks</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Completed
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-emerald-600">
                            {tasks.filter((t) => t.status === "DONE").length}
                        </span>
                        <span className="text-xs text-gray-500">Done</span>
                    </div>
                </div>
            </div>

            {/* Assigned Tasks List (Backend prioritized order: CRITICAL > HIGH > MEDIUM > LOW, then due date) */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Assigned Tasks
                        </h3>
                        <p className="text-xs text-gray-500">
                            Prioritized by urgency and due date
                        </p>
                    </div>
                    <Link
                        to="/tasks"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        View all tasks &rarr;
                    </Link>
                </div>

                {tasks.length === 0 ? (
                    <EmptyState
                        title="No tasks assigned"
                        message="You currently have no tasks assigned to you."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                <tr>
                                    <th className="px-4 py-3">Task</th>
                                    <th className="px-4 py-3">Project</th>
                                    <th className="px-4 py-3">Priority</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {task.title}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {task.project.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <TaskPriorityBadge priority={task.priority} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <TaskStatusBadge status={task.status} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString(undefined, {
                                                      month: "short",
                                                      day: "numeric",
                                                      year: "numeric",
                                                  })
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                to="/tasks"
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Manage &rarr;
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <DashboardActivityList activities={recentActivities} />
        </div>
    );
}
