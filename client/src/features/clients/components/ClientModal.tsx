import { useState } from "react";
import * as clientsService from "../clients.service";
import type { Client, CreateClientData, UpdateClientData } from "../clients.types";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Modal from "../../../shared/ui/Modal";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

interface ClientModalProps {
    client?: Client | null;
    onClose: () => void;
    onSuccess: (savedClient: Client) => void;
}

export default function ClientModal({
    client,
    onClose,
    onSuccess,
}: ClientModalProps) {
    const isEditMode = Boolean(client);

    const [name, setName] = useState(client?.name ?? "");
    const [email, setEmail] = useState(client?.email ?? "");
    const [company, setCompany] = useState(client?.company ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedCompany = company.trim();

        if (!trimmedName) {
            setError("Client name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode && client) {
                const updatePayload: UpdateClientData = {
                    name: trimmedName,
                    email: trimmedEmail || undefined,
                    company: trimmedCompany || undefined,
                };
                const updated = await clientsService.updateClient(
                    client.id,
                    updatePayload
                );
                onSuccess(updated);
            } else {
                const createPayload: CreateClientData = {
                    name: trimmedName,
                    email: trimmedEmail || undefined,
                    company: trimmedCompany || undefined,
                };
                const created = await clientsService.createClient(createPayload);
                onSuccess(created);
            }
        } catch (err) {
            setError(getErrorMessage(err, "Failed to save client"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={isEditMode ? "Edit Client" : "Create Client"}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <Input
                    label="Client Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    required
                    minLength={2}
                    maxLength={100}
                    disabled={isSubmitting}
                />

                <Input
                    label="Email (Optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@acme.com"
                    disabled={isSubmitting}
                />

                <Input
                    label="Company (Optional)"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Industries Ltd."
                    maxLength={150}
                    disabled={isSubmitting}
                />

                <div className="mt-2 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? isEditMode
                                ? "Saving..."
                                : "Creating..."
                            : isEditMode
                            ? "Save Changes"
                            : "Create Client"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
