interface PlaceholderPageProps {
    title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">
                This feature is under construction.
            </p>
        </div>
    );
}
