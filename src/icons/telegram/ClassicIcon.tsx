import * as React from "react";

export default function ClassicIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <rect width="72" height="72" rx="16" fill="white" />

            {/* Nền tròn xanh Telegram */}
            <circle cx="36" cy="36" r="24" fill="#2AABEE" />

            {/* Logo Telegram có bóng xanh nhạt + mũi tên trắng */}
            <path
                d="M30.2 38.5L29.6 45.7C30.4 45.7 30.7 45.4 31.1 45.0L34.7 41.5L42.3 47.0C43.7 47.8 44.6 47.5 45.0 45.9L49.7 25.4C50.1 23.5 49.0 22.8 47.7 23.3L19.5 33.8C17.6 34.6 17.6 35.7 19.1 36.1L26.2 38.2L43.2 28.3C44.0 27.8 44.7 28.1 44.1 28.6L30.2 38.5Z"
                fill="white"
            />
            <path
                d="M30.2 38.5L29.6 45.7C30.4 45.7 30.7 45.4 31.1 45.0L34.7 41.5L42.3 47.0C43.7 47.8 44.6 47.5 45.0 45.9L49.7 25.4C50.1 23.5 49.0 22.8 47.7 23.3L19.5 33.8C17.6 34.6 17.6 35.7 19.1 36.1L26.2 38.2L43.2 28.3C44.0 27.8 44.7 28.1 44.1 28.6L30.2 38.5Z"
                fill="#CBE9FA"
                fillOpacity="0.2"
            />
        </svg>
    );
}
