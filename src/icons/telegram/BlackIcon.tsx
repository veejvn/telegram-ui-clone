import * as React from "react";

export default function BlackIcon(props: React.SVGProps<SVGSVGElement>) {
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

            {/* Vòng tròn nền sao đêm */}
            <circle cx="36" cy="36" r="24" fill="url(#night)" />

            {/* Ngôi sao */}
            <g fill="white">
                <circle cx="26" cy="24" r="1" />
                <circle cx="46" cy="21" r="1.2" />
                <circle cx="32" cy="50" r="1" />
                <circle cx="40" cy="42" r="1.2" />
                <circle cx="50" cy="36" r="0.8" />
                <circle cx="23" cy="38" r="0.8" />
            </g>

            {/* Logo Telegram trắng */}
            <path
                d="M29.829 38.3901L29.277 46.1871C30.122 46.1871 30.488 45.8281 30.936 45.3931L34.7109 41.8461L42.398 47.4961C43.7809 48.2651 44.739 47.8841 45.1109 46.2361L49.8779 25.1681L49.879 25.1671C50.317 23.2551 49.191 22.5071 47.8379 23.0161L19.652 33.6821C17.796 34.3881 17.818 35.4511 19.292 35.8821L26.437 38.0201L43.421 27.9871C44.2179 27.4981 44.9399 27.7701 44.3289 28.3071L29.829 38.3901Z"
                fill="white"
            />

            <defs>
                <radialGradient
                    id="night"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(36 36) scale(24)"
                >
                    <stop stopColor="#192433" />
                    <stop offset="1" stopColor="#0A0D14" />
                </radialGradient>
            </defs>
        </svg>
    );
}
