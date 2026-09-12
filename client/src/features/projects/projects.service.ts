import api from "../../lib/axios";
import type {
    CreateProjectData,
    Project,
    ProjectManagerOption,
    UpdateProjectData,
} from "./projects.types";

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get<{ projects: Project[] }>("/projects");
    return response.data.projects;
};

export const getProject = async (projectId: string): Promise<Project> => {
    const response = await api.get<{ project: Project }>(`/projects/${projectId}`);
    return response.data.project;
};

export const createProject = async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post<{ project: Project }>("/projects", data);
    return response.data.project;
};

export const updateProject = async (
    projectId: string,
    data: UpdateProjectData
): Promise<Project> => {
    const response = await api.patch<{ project: Project }>(
        `/projects/${projectId}`,
        data
    );
    return response.data.project;
};

export const abandonProject = async (projectId: string): Promise<Project> => {
    const response = await api.post<{ project: Project }>(
        `/projects/${projectId}/abandon`
    );
    return response.data.project;
};

export { getClients } from "../clients/clients.service";

export const getProjectManagers = async (): Promise<ProjectManagerOption[]> => {
    const response = await api.get<{ users: ProjectManagerOption[] }>("/users", {
        params: { role: "PROJECT_MANAGER" },
    });
    return response.data.users;
};
