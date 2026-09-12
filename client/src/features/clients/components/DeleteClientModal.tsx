import { useState } from "react";
import * as clientsService from "../clients.service";
import type { Client } from "../clients.types";
import Button from "../../../shared/ui/Button";
import Modal from "../../../shared/ui/Modal";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

interface DeleteClientModalProps {
    client: Client;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteClientModal({
    client,
    onClose,
    onSuccess,
}: DeleteClientModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            await clientsService.deleteClient(client.id);
            onSuccess();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to delete client"));
            setIsDeleting(false);
        }
    };

    return (
        <Modal title="Delete Client" onClose={onClose}>
            <div className="flex flex-col gap-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <p className="text-sm text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong className="text-gray-900">{client.name}</strong>?
                </p>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Client"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
