import { LoadingSpinner } from './LoadingSpinner';

interface SubmitButtonProps {
    isLoading: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export function SubmitButton({
    isLoading,
    loadingText = "Signing in...",
    children
}: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-secondary-900 hover:bg-secondary-800 disabled:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 shadow-lg shadow-secondary-900/20 hover:shadow-xl hover:shadow-secondary-900/30 transform hover:-translate-y-0.5 disabled:transform-none"
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    {loadingText}
                </span>
            ) : (
                children
            )}
        </button>
    );
}
