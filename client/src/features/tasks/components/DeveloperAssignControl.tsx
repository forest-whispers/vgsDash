import { useState } from "react";
import type { DeveloperOption } from "../tasks.types";

interface DeveloperAssignControlProps {
    assignedDeveloperId: string | null;
    developers: DeveloperOption[];
    onAssign: (developerId: string | null) => Promise<void>;
    canManage: boolean;
    disabled?: boolean;
}

export default function DeveloperAssignControl({
    assignedDeveloperId,
    developers,
    onAssign,
    canManage,
    disabled = false,
}: DeveloperAssignControlProps) {
    const [isAssigning, setIsAssigning] = useState(false);

    const currentDeveloper = developers.find((d) => d.id === assignedDeveloperId);

    if (!canManage) {
        return (
            <span className="text-xs text-gray-700">
                {currentDeveloper ? currentDeveloper.name : "Unassigned"}
            </span>
        );
    }

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextDevId = e.target.value || null;
        if (nextDevId === (assignedDeveloperId || null)) return;

        setIsAssigning(true);
        try {
            await onAssign(nextDevId);
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className="inline-flex items-center gap-1.5">
            <select
                value={assignedDeveloperId ?? ""}
                onChange={handleChange}
                disabled={isAssigning || disabled}
                className="max-w-[150px] truncate rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 shadow-2xs hover:bg-gray-50 focus:border-blue-500 focus:outline-none disabled:opacity-60 cursor-pointer"
            >
                <option value="">Unassigned</option>
                {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                        {dev.name}
                    </option>
                ))}
            </select>
            {isAssigning && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            )}
        </div>
    );
}
