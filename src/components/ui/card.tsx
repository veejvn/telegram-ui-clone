// src/components/ui/card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
    return (
        <div className={`rounded-2xl bg-zinc-800 ${className}`} {...props}>
            {children}
        </div>
    );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
    return (
        <div className={`px-4 py-3 border-b border-zinc-700 ${className}`} {...props}>
            {children}
        </div>
    );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}
export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
    return (
        <h3 className={`text-sm font-medium text-gray-400 uppercase ${className}`} {...props}>
            {children}
        </h3>
    );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}
export function CardContent({ className = '', children, ...props }: CardContentProps) {
    return (
        <div className={`p-4 ${className}`} {...props}>
            {children}
        </div>
    );
}