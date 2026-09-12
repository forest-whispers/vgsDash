import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
    variant?: "primary" | "secondary" | "danger";
}

export default function Button({
    variant = "primary",
    className = "",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`rounded-md px-4 py-2 text-sm font-medium transition btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}