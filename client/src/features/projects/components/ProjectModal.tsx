import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import * as projectsService from "../projects.service";
import type {
    ClientOption,
    CreateProjectData,
    Project,
    ProjectManagerOption,
    UpdateProjectData,
} from "../projects.types";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Modal from "../../../shared/ui/Modal";
import Select from "../../../shared/ui/Select";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

interface ProjectModalProps {
    project?: Project | null;
    onClose: () => void;
    onSuccess: (savedProject: Project) => void;
}

export default function ProjectModal({
    project,
    onClose,
    onSuccess,
}: ProjectModalProps) {
    const { user } = useAuth();
    const isEditMode = Boolean(project);

    const [name, setName] = useState(project?.name ?? "");
    const [description, setDescription] = useState(project?.description ?? "");
    const [clientId, setClientId] = useState(project?.clientId ?? "");
    const [managerId, setManagerId] = useState(project?.managerId ?? "");

    const [clients, setClients] = useState<ClientOption[]>([]);
    const [managers, setManagers] = useState<ProjectManagerOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadOptions = async () => {
            setLoadingOptions(true);
            try {
                const clientListPromise = projectsService.getClients();
                const managerListPromise =
                    user?.role === "ADMIN"
                        ? projectsService.getProjectManagers()
                        : Promise.resolve([]);

                const [clientList, managerList] = await Promise.all([
                    clientListPromise,
                    managerListPromise,
                ]);

                if (isMounted) {
                    setClients(clientList);
                    setManagers(managerList);
                }
            } catch (err) {
                if (isMounted) {
                    setError(getErrorMessage(err, "Failed to load options"));
                }
            } finally {
                if (isMounted) {
                    setLoadingOptions(false);
                }
            }
        };

        loadOptions();

        return () => {
            isMounted = false;
        };
    }, [user?.role]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Project name is required.");
            return;
        }

        if (!clientId) {
            setError("Client is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode && project) {
                const updatePayload: UpdateProjectData = {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    clientId,
                };
                if (user?.role === "ADMIN") {
                    updatePayload.managerId = managerId || null;
                }

                const updated = await projectsService.updateProject(
                    project.id,
                    updatePayload
                );
                onSuccess(updated);
            } else {
                const createPayload: CreateProjectData = {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    clientId,
                };
                if (user?.role === "ADMIN" && managerId) {
                    createPayload.managerId = managerId;
                }

                const created = await projectsService.createProject(createPayload);
                onSuccess(created);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Failed to save project"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const clientOptions = clients.map((c) => ({
        label: c.company ? `${c.name} (${c.company})` : c.name,
        value: c.id,
    }));

    const managerOptions = managers.map((m) => ({
        label: `${m.name} (${m.email})`,
        value: m.id,
    }));

    return (
        <Modal
            title={isEditMode ? "Edit Project" : "Create Project"}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <Input
                    label="Project Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    required
                    minLength={2}
                    maxLength={150}
                    disabled={isSubmitting}
                />

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional project description..."
                        rows={3}
                        maxLength={1000}
                        disabled={isSubmitting}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <Select
                    label="Client"
                    options={clientOptions}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                    disabled={isSubmitting || loadingOptions}
                />

                {user?.role === "ADMIN" && (
                    <Select
                        label="Project Manager"
                        options={managerOptions}
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        disabled={isSubmitting || loadingOptions}
                    />
                )}

                <div className="mt-2 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || loadingOptions}>
                        {isSubmitting
                            ? isEditMode
                                ? "Saving..."
                                : "Creating..."
                            : isEditMode
                            ? "Save Changes"
                            : "Create Project"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
