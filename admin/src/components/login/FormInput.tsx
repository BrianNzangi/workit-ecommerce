import { LucideIcon } from 'lucide-react';

interface FormInputProps {
    id: string;
    type: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    icon: LucideIcon;
    disabled?: boolean;
    required?: boolean;
    extraAction?: React.ReactNode;
}

export function FormInput({
    id,
    type,
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
    disabled = false,
    required = false,
    extraAction,
}: FormInputProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-secondary-700"
                >
                    {label}
                </label>
                {extraAction}
            </div>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className="block w-full pl-11 pr-4 py-3 border border-secondary-200 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-secondary-300"
                    placeholder={placeholder}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}
