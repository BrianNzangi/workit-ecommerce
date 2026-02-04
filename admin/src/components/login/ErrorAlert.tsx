import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
    if (!message) return null;

    return (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{message}</p>
        </div>
    );
}
