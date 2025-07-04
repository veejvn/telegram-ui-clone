import * as React from "react";

export default function TurboIcon(props: React.SVGProps<SVGSVGElement>) {
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

            {/* Icon Telegram + động cơ */}
            <g fill="white">
                {/* Máy bay giấy */}
                <path d="M29.829 38.3901L29.277 46.1871C30.122 46.1871 30.488 45.8281 30.936 45.3931L34.7109 41.8461L42.398 47.4961C43.7809 48.2651 44.739 47.8841 45.1109 46.2361L49.8779 25.1681L49.879 25.1671C50.317 23.2551 49.191 22.5071 47.8379 23.0161L19.652 33.6821C17.796 34.3881 17.818 35.4511 19.292 35.8821L26.437 38.0201L43.421 27.9871C44.2179 27.4981 44.9399 27.7701 44.3289 28.3071L29.829 38.3901Z" />

                {/* Động cơ tên lửa */}
                <path d="M26.5 47.5c.6-1.6 1.7-2.7 3-3.4 1.2.9 1.9 2.2 2.3 3.9-1.6.7-3.3.8-5.3-.5zM25.8 49.3c.9.8 1.9 1.1 3 1.1.1-.9-.2-1.9-.8-2.7-1 .5-1.6 1-2.2 1.6zM28.2 52.5c-1-.2-2-.6-2.7-1.3.6-1 1.4-1.9 2.7-2.6.5.9.9 1.9.8 3.9z" />
            </g>

            {/* Gradient màu xanh tím */}
            <defs>
                <linearGradient id="grad" x1="12" y1="12" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6BE7FF" />
                    <stop offset="1" stopColor="#8E72FF" />
                </linearGradient>
            </defs>
        </svg>
    );
}
