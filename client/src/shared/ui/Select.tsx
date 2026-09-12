import type { SelectHTMLAttributes } from "react";

interface SelectOption
{
    label: string;
    value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>
{
    label?: string;
    options: SelectOption[];
}

export default function Select({
    label,
    options,
    className = "",
    ...props
}: SelectProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <select
                className={`rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 ${className}`}
                {...props}
            >
                <option value="">Select...</option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}