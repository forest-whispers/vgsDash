import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { UserRole } from "../features/auth/auth.types";
import Badge from "../shared/ui/Badge";
import Button from "../shared/ui/Button";
import NotificationDropdown from "../features/notifications/components/NotificationDropdown";

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
                {/* Notifications Dropdown */}
                <NotificationDropdown />

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
