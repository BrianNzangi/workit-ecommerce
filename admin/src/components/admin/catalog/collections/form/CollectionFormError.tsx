interface CollectionFormErrorProps {
    message: string;
}

export function CollectionFormError({ message }: CollectionFormErrorProps) {
    if (!message) return null;

    return (
        <div className="mb-4 bg-red-50 p-3 text-sm text-red-700">
            {message}
        </div>
    );
}
