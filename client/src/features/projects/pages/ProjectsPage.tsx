import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import * as projectsService from "../projects.service";
import type { ClientOption, Project } from "../projects.types";
import ProjectStatusBadge from "../components/ProjectStatusBadge";
import ProjectModal from "../components/ProjectModal";
import AbandonConfirmModal from "../components/AbandonConfirmModal";
import Button from "../../../shared/ui/Button";
import EmptyState from "../../../shared/ui/EmptyState";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function ProjectsPage() {
    const { user } = useAuth();
    const canManageProjects =
        user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

    const [projects, setProjects] = useState<Project[]>([]);
    const [clientsMap, setClientsMap] = useState<Record<string, ClientOption>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [abandoningProject, setAbandoningProject] = useState<Project | null>(null);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = () => {
        setIsLoading(true);
        setError(null);
        setRefreshIndex((prev) => prev + 1);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [projectsData, clientsData] = await Promise.all([
                    projectsService.getProjects(),
                    projectsService.getClients().catch(() => [] as ClientOption[]),
                ]);

                if (isMounted) {
                    setProjects(projectsData);
                    const cMap: Record<string, ClientOption> = {};
                    for (const c of clientsData) {
                        cMap[c.id] = c;
                    }
                    setClientsMap(cMap);
                }
            } catch (err) {
                if (isMounted) {
                    setError(getErrorMessage(err, "Unable to load projects"));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [refreshIndex]);

    const handleProjectCreated = (newProject: Project) => {
        setProjects((prev) => [newProject, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleProjectUpdated = (updatedProject: Project) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
        setEditingProject(null);
    };

    const handleProjectAbandoned = async () => {
        if (!abandoningProject) return;
        const result = await projectsService.abandonProject(abandoningProject.id);
        setProjects((prev) =>
            prev.map((p) => (p.id === result.id ? { ...p, status: result.status } : p))
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Projects
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View, organize, and manage all your team projects.
                    </p>
                </div>

                {canManageProjects && (
                    <Button
                        variant="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="self-start sm:self-auto"
                    >
                        + Create Project
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <span>{error}</span>
                    <Button variant="secondary" onClick={refetch} className="text-xs">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <Spinner />
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center gap-4">
                    <EmptyState
                        title="No projects found"
                        message={
                            canManageProjects
                                ? "Get started by creating your first project."
                                : "No projects are currently assigned to you."
                        }
                    />
                    {canManageProjects && (
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Project
                        </Button>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">Project</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3">Updated</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {projects.map((project) => {
                                    const client = clientsMap[project.clientId];
                                    const isAbandoned = project.status === "ABANDONED";

                                    return (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-gray-50/75 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/projects/${project.id}`}
                                                    className="font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    {project.name}
                                                </Link>
                                                {project.description && (
                                                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1 max-w-md">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <ProjectStatusBadge status={project.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {client ? (
                                                    <div>
                                                        <div className="font-medium text-gray-800">
                                                            {client.name}
                                                        </div>
                                                        {client.company && (
                                                            <div className="text-xs text-gray-500">
                                                                {client.company}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {project.clientId}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {new Date(project.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/projects/${project.id}`}
                                                        className="rounded px-2 py-1 font-medium text-blue-600 hover:bg-blue-50"
                                                    >
                                                        View
                                                    </Link>

                                                    {canManageProjects && !isAbandoned && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingProject(project)}
                                                                className="rounded px-2 py-1 font-medium text-gray-600 hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAbandoningProject(project)}
                                                                className="rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50"
                                                            >
                                                                Abandon
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <ProjectModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleProjectCreated}
                />
            )}

            {/* Edit Project Modal */}
            {editingProject && (
                <ProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSuccess={handleProjectUpdated}
                />
            )}

            {/* Abandon Confirmation Modal */}
            {abandoningProject && (
                <AbandonConfirmModal
                    projectName={abandoningProject.name}
                    onClose={() => setAbandoningProject(null)}
                    onConfirm={handleProjectAbandoned}
                />
            )}
        </div>
    );
}
