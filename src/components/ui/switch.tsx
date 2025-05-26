// src/components/ui/switch.tsx
import React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
export function Switch({ checked, onCheckedChange, className = '', ...props }: SwitchProps) {
    return (
        <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
                className="sr-only"
                {...props}
            />
            <div
                className={`w-10 h-6 bg-zinc-700 rounded-full shadow-inner transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-500' : 'bg-zinc-700'
                    }`}
            />
            <div
                className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
            />
        </label>
    );
}