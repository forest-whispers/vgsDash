import { Link } from "react-router-dom";
import type { ProjectManagerDashboardData } from "../dashboard.types";
import TaskPriorityBadge from "../../tasks/components/TaskPriorityBadge";
import TaskStatusBadge from "../../tasks/components/TaskStatusBadge";
import DashboardActivityList from "./DashboardActivityList";
import EmptyState from "../../../shared/ui/EmptyState";

interface ProjectManagerDashboardViewProps {
    dashboard: ProjectManagerDashboardData;
}

export default function ProjectManagerDashboardView({
    dashboard,
}: ProjectManagerDashboardViewProps) {
    const { projects, tasks, upcomingDueDates, recentActivities } = dashboard;

    const priorityCounts = [
        { label: "Low", count: tasks.byPriority.LOW ?? 0, bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" },
        { label: "Medium", count: tasks.byPriority.MEDIUM ?? 0, bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
        { label: "High", count: tasks.byPriority.HIGH ?? 0, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
        { label: "Critical", count: tasks.byPriority.CRITICAL ?? 0, bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Top KPI Cards - Project Summary & Tasks Total */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Projects */}
                <Link
                    to="/projects"
                    className="block rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Managed Projects
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                            {projects.total}
                        </span>
                        <span className="text-xs font-medium text-blue-600 hover:underline">
                            View projects &rarr;
                        </span>
                    </div>
                </Link>

                {/* Active Projects */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Active Projects
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-emerald-600">
                            {projects.active}
                        </span>
                        <span className="text-xs text-gray-500">In progress</span>
                    </div>
                </div>

                {/* Abandoned Projects */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Abandoned Projects
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-gray-500">
                            {projects.abandoned}
                        </span>
                        <span className="text-xs text-gray-400">Archived</span>
                    </div>
                </div>

                {/* Total Tasks */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Tasks
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                            {tasks.total}
                        </span>
                        <span className="text-xs text-gray-500">Across managed</span>
                    </div>
                </div>
            </div>

            {/* Tasks by Priority */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Tasks by Priority
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {priorityCounts.map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-lg border ${item.border} ${item.bg} p-4 text-center`}
                        >
                            <p className="text-xs font-medium text-gray-600">{item.label}</p>
                            <p className={`mt-1 text-2xl font-bold ${item.text}`}>{item.count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Due Dates */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Upcoming Due Dates
                        </h3>
                        <p className="text-xs text-gray-500">
                            Incomplete tasks due this week
                        </p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {upcomingDueDates.length} upcoming
                    </span>
                </div>

                {upcomingDueDates.length === 0 ? (
                    <EmptyState
                        title="No upcoming tasks"
                        message="No tasks are currently scheduled for completion this week."
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
                                {upcomingDueDates.map((task) => (
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
                                                to={`/projects/${task.projectId}`}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                View &rarr;
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
