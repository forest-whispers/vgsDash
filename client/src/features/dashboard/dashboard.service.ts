import api from "../../lib/axios";
import type { DashboardData, DashboardResponse } from "./dashboard.types";

export const getDashboard = async (): Promise<DashboardData> => {
    const response = await api.get<DashboardResponse>("/dashboard");
    return response.data.dashboard;
};
