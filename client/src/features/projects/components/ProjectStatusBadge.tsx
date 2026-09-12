import type { ProjectStatus } from "../projects.types";
import Badge from "../../../shared/ui/Badge";

interface ProjectStatusBadgeProps {
    status: ProjectStatus;
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
    switch (status) {
        case "ACTIVE":
            return <Badge variant="success">Active</Badge>;
        case "PLANNING":
            return <Badge variant="default">Planning</Badge>;
        case "ON_HOLD":
            return <Badge variant="warning">On Hold</Badge>;
        case "COMPLETED":
            return <Badge variant="success">Completed</Badge>;
        case "ABANDONED":
            return <Badge variant="danger">Abandoned</Badge>;
        default:
            return <Badge variant="default">{status}</Badge>;
    }
}
