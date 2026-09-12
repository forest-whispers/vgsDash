import { useEffect, useState } from "react";
import * as clientsService from "../clients.service";
import type { Client } from "../clients.types";
import ClientModal from "../components/ClientModal";
import DeleteClientModal from "../components/DeleteClientModal";
import Button from "../../../shared/ui/Button";
import EmptyState from "../../../shared/ui/EmptyState";
import Spinner from "../../../shared/ui/Spinner";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);

    const [refreshIndex, setRefreshIndex] = useState(0);

    const refetch = () => {
        setIsLoading(true);
        setError(null);
        setRefreshIndex((prev) => prev + 1);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchClients = async () => {
            try {
                const data = await clientsService.getClients();
                if (isMounted) {
                    setClients(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(getErrorMessage(err, "Failed to load clients"));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchClients();

        return () => {
            isMounted = false;
        };
    }, [refreshIndex]);

    const handleClientCreated = (newClient: Client) => {
        setClients((prev) => [newClient, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleClientUpdated = (updatedClient: Client) => {
        setClients((prev) =>
            prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
        );
        setEditingClient(null);
    };

    const handleClientDeleted = () => {
        if (!deletingClient) return;
        setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
        setDeletingClient(null);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Clients
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage company clients, contacts, and account associations.
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="self-start sm:self-auto"
                >
                    + Create Client
                </Button>
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
            ) : clients.length === 0 ? (
                <div className="flex flex-col items-center gap-4">
                    <EmptyState
                        title="No clients found"
                        message="Get started by adding your first client."
                    />
                    <Button
                        variant="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create Client
                    </Button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-3">Client Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Company</th>
                                    <th className="px-6 py-3">Created Date</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-gray-50/75 transition"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {client.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {client.email || (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {client.company || (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(client.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingClient(client)}
                                                    className="rounded px-2.5 py-1 font-medium text-blue-600 hover:bg-blue-50 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingClient(client)}
                                                    className="rounded px-2.5 py-1 font-medium text-red-600 hover:bg-red-50 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Client Modal */}
            {isCreateModalOpen && (
                <ClientModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleClientCreated}
                />
            )}

            {/* Edit Client Modal */}
            {editingClient && (
                <ClientModal
                    client={editingClient}
                    onClose={() => setEditingClient(null)}
                    onSuccess={handleClientUpdated}
                />
            )}

            {/* Delete Client Modal */}
            {deletingClient && (
                <DeleteClientModal
                    client={deletingClient}
                    onClose={() => setDeletingClient(null)}
                    onSuccess={handleClientDeleted}
                />
            )}
        </div>
    );
}
