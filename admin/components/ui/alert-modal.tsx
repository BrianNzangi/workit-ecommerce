'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    title: string;
    description: string;
}

export const AlertModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    title,
    description,
}: AlertModalProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">{description}</p>

                <div className="flex items-center justify-end w-full space-x-2">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className="px-4 py-2 bg-primary-800 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-900 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};
