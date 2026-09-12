import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { UserRole } from "../../auth/auth.types";
import * as usersService from "../users.service";
import type { ManagedUser } from "../users.types";
import Badge from "../../../shared/ui/Badge";
import Button from "../../../shared/ui/Button";
import EmptyState from "../../../shared/ui/EmptyState";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

const formatRole = (role: UserRole): string => {
    switch (role) {
        case "ADMIN":
            return "Admin";
        case "PROJECT_MANAGER":
            return "Project Manager";
        case "DEVELOPER":
            return "Developer";
        default:
            return role;
    }
};

const getRoleBadgeVariant = (
    role: UserRole
): "default" | "success" | "warning" => {
    switch (role) {
        case "ADMIN":
            return "warning";
        case "PROJECT_MANAGER":
            return "success";
        default:
            return "default";
    }
};

export default function UsersPage() {
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = () => {
        setIsLoading(true);
        setError(null);
        setRefreshIndex((prev) => prev + 1);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                const data = await usersService.getUsers();
                if (isMounted) {
                    setUsers(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(getErrorMessage(err, "Failed to load users"));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, [refreshIndex]);

    const handleRoleChange = async (targetUser: ManagedUser, newRole: UserRole) => {
        if (targetUser.role === newRole) return;

        setUpdatingUserId(targetUser.id);
        setActionError(null);

        try {
            const updated = await usersService.updateUserRole(
                targetUser.id,
                newRole
            );
            setUsers((prev) =>
                prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
            );
        } catch (err) {
            setActionError(getErrorMessage(err, "Failed to update user role"));
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Users
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage team members and configure role-based permissions.
                </p>
            </div>

            {/* Error Banners */}
            {error && (
                <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <span>{error}</span>
                    <Button variant="secondary" onClick={refetch} className="text-xs">
                        Try Again
                    </Button>
                </div>
            )}

            {actionError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {actionError}
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <Spinner />
                </div>
            ) : users.length === 0 ? (
                <EmptyState
                    title="No users found"
                    message="No registered users were returned by the system."
                />
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Current Role</th>
                                    <th className="px-6 py-3">Change Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => {
                                    const isSelf = user.id === currentUser?.id;
                                    const isUpdating = updatingUserId === user.id;

                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50/75 transition"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {user.name}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-800">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {formatRole(user.role)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isSelf ? (
                                                    <span className="text-xs text-gray-400 italic">
                                                        Cannot change own role
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) =>
                                                                handleRoleChange(
                                                                    user,
                                                                    e.target.value as UserRole
                                                                )
                                                            }
                                                            disabled={isUpdating}
                                                            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 disabled:opacity-50"
                                                        >
                                                            <option value="DEVELOPER">
                                                                Developer
                                                            </option>
                                                            <option value="PROJECT_MANAGER">
                                                                Project Manager
                                                            </option>
                                                            <option value="ADMIN">
                                                                Admin
                                                            </option>
                                                        </select>
                                                        {isUpdating && (
                                                            <span className="text-xs text-blue-600">
                                                                Updating...
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
