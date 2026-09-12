import { useEffect, useState, useCallback } from "react";
import { Outlet, useParams } from "react-router-dom";
import {
    getSocket,
    SOCKET_EVENTS,
    type PresenceUser,
    type PresenceUpdatePayload,
    type ProjectJoinAck,
} from "../lib/socket";
import Badge from "../shared/ui/Badge";

const formatRole = (role?: string): string => {
    switch (role) {
        case "ADMIN":
            return "Admin";
        case "PROJECT_MANAGER":
            return "Project Manager";
        case "DEVELOPER":
            return "Developer";
        default:
            return role ?? "";
    }
};

const getRoleBadgeVariant = (role?: string): "default" | "success" | "warning" => {
    switch (role) {
        case "ADMIN":
            return "warning";
        case "PROJECT_MANAGER":
            return "success";
        default:
            return "default";
    }
};

export default function ProjectLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    const [presenceMap, setPresenceMap] = useState<Map<string, PresenceUser>>(new Map());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [joinError, setJoinError] = useState<string | null>(null);

    const joinProjectRoom = useCallback((pId: string) => {
        const socket = getSocket();
        socket.emit("project:join", pId, (response: ProjectJoinAck) => {
            if (!response.success) {
                console.error("Failed to join project room:", response.message);
                setJoinError(response.message || "Failed to join project room");
            } else {
                setJoinError(null);
            }
        });
    }, []);

    useEffect(() => {
        if (!projectId) return;

        const socket = getSocket();

        // Join room
        joinProjectRoom(projectId);

        // On presence update event
        const handlePresenceUpdate = (payload: PresenceUpdatePayload) => {
            if (!payload?.users) return;

            setPresenceMap((prev) => {
                const next = new Map(prev);
                for (const user of payload.users) {
                    if (user.online) {
                        next.set(user.id, user);
                    } else {
                        next.delete(user.id);
                    }
                }
                return next;
            });
        };

        // Handle reconnect: re-join room
        const handleConnect = () => {
            joinProjectRoom(projectId);
        };

        socket.on(SOCKET_EVENTS.presenceUpdate, handlePresenceUpdate);
        socket.on("connect", handleConnect);

        return () => {
            socket.emit("project:leave", projectId, () => {
                // acknowledged
            });
            socket.off(SOCKET_EVENTS.presenceUpdate, handlePresenceUpdate);
            socket.off("connect", handleConnect);
            setPresenceMap(new Map());
        };
    }, [projectId, joinProjectRoom]);

    const activeUsers = Array.from(presenceMap.values());

    return (
        <div className="flex w-full gap-6 items-start">
            {/* Main Project Content Area */}
            <div className="flex-1 min-w-0">
                {joinError && (
                    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                        {joinError}
                    </div>
                )}
                <Outlet />
            </div>

            {/* Collapsible Presence Sidebar */}
            <aside
                className={`transition-all duration-200 shrink-0 bg-white border border-gray-200 rounded-lg shadow-xs sticky top-20 overflow-hidden ${
                    isSidebarOpen ? "w-64" : "w-14"
                }`}
                aria-label="Active Project Members"
            >
                {/* Header / Toggle Button */}
                <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                                Online ({activeUsers.length})
                            </h3>
                        </div>
                    ) : (
                        <div className="mx-auto relative flex items-center justify-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition focus:outline-none"
                        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <svg
                            className={`h-4 w-4 transform transition-transform duration-200 ${
                                isSidebarOpen ? "" : "rotate-180"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Body */}
                {isSidebarOpen ? (
                    <div className="p-3 max-h-[calc(100vh-14rem)] overflow-y-auto">
                        {activeUsers.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">
                                No active users
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {activeUsers.map((user) => (
                                    <li
                                        key={user.id}
                                        className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                            <span className="font-mono text-xs text-gray-700 truncate" title={user.id}>
                                                {user.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={getRoleBadgeVariant(user.role)}
                                        >
                                            {formatRole(user.role)}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="py-3 flex flex-col items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-600">
                            {activeUsers.length}
                        </span>
                    </div>
                )}
            </aside>
        </div>
    );
}
