// src/components/ui/separator.tsx
import React from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> { }
export function Separator({ className = '', ...props }: SeparatorProps) {
    return <hr className={`border-zinc-700 ${className}`} {...props} />;
}
