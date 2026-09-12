interface BadgeProps
{
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
}

export default function Badge({
    children,
    variant = "default",
}: BadgeProps) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium badge-${variant}`}
        >
            {children}
        </span>
    );
}