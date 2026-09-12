import { Link } from "react-router-dom";
import type { AdminDashboardData } from "../dashboard.types";
import DashboardActivityList from "./DashboardActivityList";

interface AdminDashboardViewProps {
    dashboard: AdminDashboardData;
}

export default function AdminDashboardView({ dashboard }: AdminDashboardViewProps) {
    const { projects, tasks, overdueTasks, recentActivities } = dashboard;

    const statusCounts = [
        { label: "To Do", count: tasks.byStatus.TODO ?? 0, bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
        { label: "In Progress", count: tasks.byStatus.IN_PROGRESS ?? 0, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
        { label: "In Review", count: tasks.byStatus.IN_REVIEW ?? 0, bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
        { label: "Done", count: tasks.byStatus.DONE ?? 0, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Projects */}
                <Link
                    to="/projects"
                    className="block rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Projects
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

                {/* Total Tasks */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Total Tasks
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                            {tasks.total}
                        </span>
                        <span className="text-xs text-gray-500">Across all projects</span>
                    </div>
                </div>

                {/* Overdue Tasks */}
                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Overdue Tasks
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className={`text-3xl font-bold tracking-tight ${overdueTasks > 0 ? "text-red-600" : "text-gray-900"}`}>
                            {overdueTasks}
                        </span>
                        <span className="text-xs text-gray-500">Need attention</span>
                    </div>
                </div>

                {/* Active Users */}
                <Link
                    to="/users"
                    className="block rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-sm"
                >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Active Users
                    </p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-3xl font-bold tracking-tight text-gray-900">
                            Manage
                        </span>
                        <span className="text-xs font-medium text-blue-600 hover:underline">
                            View users &rarr;
                        </span>
                    </div>
                </Link>
            </div>

            {/* Tasks by Status Breakdown */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                    Tasks by Status
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {statusCounts.map((item) => (
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

            {/* Recent Activity */}
            <DashboardActivityList activities={recentActivities} />
        </div>
    );
}
