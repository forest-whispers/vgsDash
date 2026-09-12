import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Modal from "../../../shared/ui/Modal";
import { getErrorMessage } from "../../../shared/utils/getErrorMessage";

interface AbandonConfirmModalProps {
    projectName: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function AbandonConfirmModal({
    projectName,
    onClose,
    onConfirm,
}: AbandonConfirmModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to abandon project"));
            setIsSubmitting(false);
        }
    };

    return (
        <Modal title="Abandon Project" onClose={onClose}>
            <div className="flex flex-col gap-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <p className="text-sm text-gray-600">
                    Are you sure you want to abandon{" "}
                    <strong className="text-gray-900">{projectName}</strong>?
                </p>
                <p className="text-xs text-red-600">
                    Warning: Abandoned projects cannot be updated or modified.
                </p>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Abandoning..." : "Abandon Project"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
