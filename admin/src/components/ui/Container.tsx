import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
    return (
        <div className={`w-full max-w-[1800px] mx-auto ${className}`}>
            {children}
        </div>
    );
}
