import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import * as projectsService from "../projects.service";
import type { ClientOption, Project } from "../projects.types";
import ProjectStatusBadge from "../components/ProjectStatusBadge";
import ProjectModal from "../components/ProjectModal";
import AbandonConfirmModal from "../components/AbandonConfirmModal";
import ProjectTasksSection from "../../tasks/components/ProjectTasksSection";
import Button from "../../../shared/ui/Button";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function ProjectDetailsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { user } = useAuth();
    const canManageProjects =
        user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

    const [project, setProject] = useState<Project | null>(null);
    const [client, setClient] = useState<ClientOption | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = () => {
        setIsLoading(true);
        setError(null);
        setRefreshIndex((prev) => prev + 1);
    };

    useEffect(() => {
        if (!projectId) return;
        let isMounted = true;

        const fetchProject = async () => {
            try {
                const projectData = await projectsService.getProject(projectId);
                if (!isMounted) return;
                setProject(projectData);

                if (projectData.clientId) {
                    projectsService
                        .getClients()
                        .then((clients) => {
                            if (!isMounted) return;
                            const matchedClient = clients.find(
                                (c) => c.id === projectData.clientId
                            );
                            if (matchedClient) {
                                setClient(matchedClient);
                            }
                        })
                        .catch(() => {
                            // Non-critical, ignore
                        });
                }
            } catch (err) {
                if (isMounted) {
                    setError(getErrorMessage(err, "Failed to load project details"));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProject();

        return () => {
            isMounted = false;
        };
    }, [projectId, refreshIndex]);

    const handleProjectUpdated = (updatedProject: Project) => {
        setProject(updatedProject);
        setIsEditModalOpen(false);
    };

    const handleProjectAbandoned = async () => {
        if (!project) return;
        const result = await projectsService.abandonProject(project.id);
        setProject((prev) =>
            prev ? { ...prev, status: result.status } : null
        );
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[350px] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex flex-col gap-4">
                <Link
                    to="/projects"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    &larr; Back to Projects
                </Link>
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-semibold">{error || "Project not found"}</p>
                    <Button
                        variant="secondary"
                        onClick={refetch}
                        className="mt-3 text-xs"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const isAbandoned = project.status === "ABANDONED";

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumb / Back Navigation */}
            <div>
                <Link
                    to="/projects"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    &larr; Back to Projects
                </Link>
            </div>

            {/* Abandoned Notice */}
            {isAbandoned && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold">
                        <span>Notice</span>
                    </div>
                    <p className="mt-1 text-xs text-amber-700">
                        This project has been abandoned. Modifying or re-assigning abandoned
                        projects is disabled.
                    </p>
                </div>
            )}

            {/* Header / Summary Card */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {project.name}
                        </h1>
                        <ProjectStatusBadge status={project.status} />
                    </div>
                    {project.description && (
                        <p className="text-sm text-gray-600 max-w-2xl">
                            {project.description}
                        </p>
                    )}
                </div>

                {canManageProjects && !isAbandoned && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit Project
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => setIsAbandonModalOpen(true)}
                        >
                            Abandon
                        </Button>
                    </div>
                )}
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                        Client Information
                    </h2>
                    <div className="mt-4 flex flex-col gap-3 text-sm">
                        {client ? (
                            <>
                                <div>
                                    <span className="text-xs text-gray-500 font-medium">Name</span>
                                    <div className="font-medium text-gray-800">{client.name}</div>
                                </div>
                                {client.company && (
                                    <div>
                                        <span className="text-xs text-gray-500 font-medium">Company</span>
                                        <div className="text-gray-700">{client.company}</div>
                                    </div>
                                )}
                                {client.email && (
                                    <div>
                                        <span className="text-xs text-gray-500 font-medium">Email</span>
                                        <div className="text-gray-700">{client.email}</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                <span className="text-xs text-gray-500 font-medium">Client ID</span>
                                <div className="font-mono text-xs text-gray-700">{project.clientId}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Metadata Card */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
                    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
                        Metadata & Timeline
                    </h2>
                    <div className="mt-4 flex flex-col gap-3 text-sm">
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Project Manager ID</span>
                            <div className="font-mono text-xs text-gray-700">
                                {project.managerId || "Not assigned"}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Created Date</span>
                            <div className="text-gray-700">
                                {new Date(project.createdAt).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                            <div className="text-gray-700">
                                {new Date(project.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks Workspace */}
            <ProjectTasksSection
                projectId={project.id}
                isAbandoned={isAbandoned}
            />

            {/* Edit Project Modal */}
            {isEditModalOpen && (
                <ProjectModal
                    project={project}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleProjectUpdated}
                />
            )}

            {/* Abandon Confirmation Modal */}
            {isAbandonModalOpen && (
                <AbandonConfirmModal
                    projectName={project.name}
                    onClose={() => setIsAbandonModalOpen(false)}
                    onConfirm={handleProjectAbandoned}
                />
            )}
        </div>
    );
}
