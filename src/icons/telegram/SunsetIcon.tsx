import * as React from "react";

export default function SunsetIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width={72}
            height={72}
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Khung bo góc nền trắng */}
            <rect width="72" height="72" rx="16" fill="white" />

            {/* Vòng tròn nền gradient sunset */}
            <defs>
                <linearGradient id="sunsetGradient" x1="18" y1="18" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFB6C1" />    {/* light pink */}
                    <stop offset="0.5" stopColor="#FF69B4" />  {/* hot pink */}
                    <stop offset="1" stopColor="#6495ED" />    {/* cornflower blue */}
                </linearGradient>
            </defs>
            <circle cx="36" cy="36" r="24" fill="url(#sunsetGradient)" />

            {/* Logo Telegram trắng */}
            <path
                d="M29.829 38.3901L29.277 46.1871C30.122 46.1871 30.488 45.8281 30.936 45.3931L34.7109 41.8461L42.398 47.4961C43.7809 48.2651 44.739 47.8841 45.1109 46.2361L49.8779 25.1681L49.879 25.1671C50.317 23.2551 49.191 22.5071 47.8379 23.0161L19.652 33.6821C17.796 34.3881 17.818 35.4511 19.292 35.8821L26.437 38.0201L43.421 27.9871C44.2179 27.4981 44.9399 27.7701 44.3289 28.3071L29.829 38.3901Z"
                fill="white"
            />
        </svg>
    );
}
