// src/components/ui/avatar.tsx
import React from 'react';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    children?: React.ReactNode;
}
export function Avatar({ src, alt, className = '', children, ...props }: AvatarProps) {
    return (
        <div className={`rounded-full overflow-hidden bg-gray-600 ${className}`} {...props}>
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <>{children}</>
            )}
        </div>
    );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
}
export function AvatarFallback({ className = '', children, ...props }: AvatarFallbackProps) {
    return (
        <span
            className={`flex items-center justify-center h-full w-full text-white ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
