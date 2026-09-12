import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import type { UserRole } from "../features/auth/auth.types";

interface NavItem {
    label: string;
    path: string;
}

const getNavItems = (role?: UserRole): NavItem[] => {
    switch (role) {
        case "ADMIN":
            return [
                { label: "Dashboard", path: "/dashboard" },
                { label: "Projects", path: "/projects" },
                { label: "Clients", path: "/clients" },
                { label: "Activity", path: "/activity" },
            ];
        case "PROJECT_MANAGER":
            return [
                { label: "Dashboard", path: "/dashboard" },
                { label: "Projects", path: "/projects" },
                { label: "Activity", path: "/activity" },
            ];
        case "DEVELOPER":
            return [
                { label: "Dashboard", path: "/dashboard" },
                { label: "My Tasks", path: "/tasks" },
                { label: "Activity", path: "/activity" },
            ];
        default:
            return [{ label: "Dashboard", path: "/dashboard" }];
    }
};

export default function Sidebar() {
    const { user } = useAuth();
    const navItems = getNavItems(user?.role);

    return (
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-white p-4 min-h-[calc(100vh-4rem)]">
            <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            `rounded-md px-3 py-2 text-sm font-medium transition ${
                                isActive
                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
