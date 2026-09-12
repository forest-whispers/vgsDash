import type { ReactNode } from "react";

interface AuthFormContainerProps
{
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export default function AuthFormContainer({
    title,
    subtitle,
    children,
}: AuthFormContainerProps) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>

            {children}
        </div>
    );
}