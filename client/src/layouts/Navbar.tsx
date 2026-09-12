import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { UserRole } from "../features/auth/auth.types";
import Badge from "../shared/ui/Badge";
import Button from "../shared/ui/Button";

const formatRole = (role?: UserRole): string => {
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

const getRoleBadgeVariant = (role?: UserRole): "default" | "success" | "warning" => {
    switch (role) {
        case "ADMIN":
            return "warning";
        case "PROJECT_MANAGER":
            return "success";
        default:
            return "default";
    }
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                    Project Dashboard
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification indicator placeholder */}
                <div
                    className="relative flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 cursor-pointer rounded-full hover:bg-gray-100 transition"
                    title="Notifications (Coming Soon)"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                </div>

                {/* User info */}
                {user && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">
                            {user.name}
                        </span>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                            {formatRole(user.role)}
                        </Badge>
                    </div>
                )}

                {/* Logout button */}
                <Button
                    variant="secondary"
                    onClick={handleLogout}
                    className="text-xs px-3 py-1.5"
                >
                    Logout
                </Button>
            </div>
        </header>
    );
}
