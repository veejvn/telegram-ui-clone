import * as React from "react";

export default function PremiumIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width={72}
            height={72}
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Nền trắng bo góc */}
            <rect x="0" y="0" width="72" height="72" rx="16" fill="white" />

            {/* Hình tròn nền gradient */}
            <circle cx="36" cy="36" r="24" fill="url(#grad)" />

            {/* Icon ngôi sao trắng */}
            <path
                fill="white"
                d="M35.4 21.6c.3-.9 1.6-.9 1.9 0l2.9 7.5c.1.3.4.6.7.6l8 .6c.9.1 1.3 1.2.6 1.8l-6.2 5.1c-.3.2-.4.6-.3.9l2.2 7.8c.2.9-.7 1.6-1.5 1.1l-6.6-4.3c-.3-.2-.6-.2-.9 0l-6.6 4.3c-.8.5-1.7-.2-1.5-1.1l2.2-7.8c.1-.3 0-.7-.3-.9l-6.2-5.1c-.7-.6-.3-1.7.6-1.8l8-.6c.3 0 .6-.3.7-.6l2.9-7.5z"
            />

            {/* Gradient */}
            <defs>
                <linearGradient id="grad" x1="12" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EA61E3" />
                    <stop offset="0.5" stopColor="#A66CFF" />
                    <stop offset="1" stopColor="#4D9CFF" />
                </linearGradient>
            </defs>
        </svg>
    );
}
