import { useCallback, useEffect, useState } from "react";
import * as activitiesService from "../activities.service";
import type { Activity } from "../activities.types";
import { formatActivityAction } from "../utils/formatActivity";
import Button from "../../../shared/ui/Button";
import EmptyState from "../../../shared/ui/EmptyState";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setRefreshIndex((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;
        activitiesService
            .getActivities()
            .then((data) => {
                if (!isMounted) return;
                setActivities(data);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(getErrorMessage(err, "Failed to load activities"));
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [refreshIndex]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Recent events and updates across your projects and tasks.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {activities.length} {activities.length === 1 ? "Event" : "Events"}
                    </span>
                    <Button variant="secondary" onClick={refetch} className="text-xs py-1.5">
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
                    <Spinner />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-semibold">{error}</p>
                    <Button
                        variant="secondary"
                        onClick={refetch}
                        className="mt-3 text-xs"
                    >
                        Try Again
                    </Button>
                </div>
            ) : activities.length === 0 ? (
                <EmptyState
                    title="No activity recorded"
                    message="Actions performed on projects and tasks will appear here in chronological order."
                />
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white shadow-xs divide-y divide-gray-100">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                                    {activity.actor.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-sm text-gray-800">
                                        <span className="font-semibold text-gray-900">
                                            {activity.actor.name}
                                        </span>{" "}
                                        {formatActivityAction(activity)}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">
                                            Project: {activity.projectId.slice(0, 8)}
                                        </span>
                                        {activity.taskId && (
                                            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">
                                                Task: {activity.taskId.slice(0, 8)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 whitespace-nowrap self-start sm:self-center">
                                {new Date(activity.createdAt).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
