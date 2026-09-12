import { Link } from "react-router-dom";
import type { Activity } from "../../activities/activities.types";
import { formatActivityAction } from "../../activities/utils/formatActivity";
import EmptyState from "../../../shared/ui/EmptyState";

interface DashboardActivityListProps {
    activities: Activity[];
}

export default function DashboardActivityList({ activities }: DashboardActivityListProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                <Link
                    to="/activity"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                    View all
                </Link>
            </div>

            {activities.length === 0 ? (
                <EmptyState
                    title="No recent activity"
                    message="Recent actions across projects and tasks will appear here."
                />
            ) : (
                <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100 pr-1">
                    {activities.map((activity) => (
                        <div key={activity.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                                {activity.actor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-800 leading-snug">
                                    <span className="font-semibold text-gray-900">
                                        {activity.actor.name}
                                    </span>{" "}
                                    {formatActivityAction(activity)}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                                    <span className="truncate max-w-[120px] rounded bg-gray-100 px-1 py-0.2 font-mono text-[10px] text-gray-600">
                                        Proj: {activity.projectId.slice(0, 8)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {new Date(activity.createdAt).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                        })}{" "}
                                        {new Date(activity.createdAt).toLocaleTimeString(undefined, {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
