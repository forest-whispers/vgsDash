import type { ReactNode } from "react";

interface ModalProps
{
    title: string;
    children: ReactNode;
    onClose: () => void;
}

export default function Modal({
    title,
    children,
    onClose,
}: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-gray-500 hover:text-gray-800"
                    >
                        ×
                    </button>
                </div>

                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}