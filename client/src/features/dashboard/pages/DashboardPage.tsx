import { useCallback, useEffect, useState } from "react";
import * as dashboardService from "../dashboard.service";
import type { DashboardData } from "../dashboard.types";
import AdminDashboardView from "../components/AdminDashboardView";
import ProjectManagerDashboardView from "../components/ProjectManagerDashboardView";
import DeveloperDashboardView from "../components/DeveloperDashboardView";
import Button from "../../../shared/ui/Button";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
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
        dashboardService
            .getDashboard()
            .then((data) => {
                if (!isMounted) return;
                setDashboard(data);
                setError(null);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(getErrorMessage(err, "Failed to load dashboard"));
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
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Overview and metrics tailored to your role.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={refetch}
                        className="text-xs py-1.5"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex min-h-[350px] items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
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
            ) : !dashboard ? null : dashboard.role === "ADMIN" ? (
                <AdminDashboardView dashboard={dashboard} />
            ) : dashboard.role === "PROJECT_MANAGER" ? (
                <ProjectManagerDashboardView dashboard={dashboard} />
            ) : dashboard.role === "DEVELOPER" ? (
                <DeveloperDashboardView dashboard={dashboard} />
            ) : null}
        </div>
    );
}
