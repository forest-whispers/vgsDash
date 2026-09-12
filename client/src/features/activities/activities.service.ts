import api from "../../lib/axios";
import type { Activity, ActivityFilters } from "./activities.types";

export const getActivities = async (
    filters?: ActivityFilters
): Promise<Activity[]> => {
    const params: Record<string, number> = {};
    if (filters?.limit) {
        params.limit = filters.limit;
    }

    const response = await api.get<{ activities: Activity[] }>("/activities", {
        params,
    });
    return response.data.activities;
};
