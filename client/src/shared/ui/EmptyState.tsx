interface EmptyStateProps
{
    title: string;
    message?: string;
}

export default function EmptyState({
    title,
    message,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
            <h3 className="font-medium text-gray-800">
                {title}
            </h3>

            {message && (
                <p className="mt-1 text-sm text-gray-500">
                    {message}
                </p>
            )}
        </div>
    );
}