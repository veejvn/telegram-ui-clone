import React from "react";

interface ForwardIconSvgProps {
  isDark?: boolean;
}

export default function ForwardIconSvg({ isDark }: ForwardIconSvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M14.554 3.9974L19.2301 8.13188C21.0767 9.76455 22 10.5809 22 11.6325C22 12.6842 21.0767 13.5005 19.2301 15.1332L14.554 19.2677C13.7111 20.0129 13.2897 20.3856 12.9422 20.2303C12.5947 20.0751 12.5947 19.5143 12.5947 18.3925V15.6472C8.35683 15.6472 3.76579 17.6545 2 21C2 10.2943 8.27835 7.61792 12.5947 7.61792V4.87257C12.5947 3.75082 12.5947 3.18995 12.9422 3.03474C13.2897 2.87953 13.7111 3.25215 14.554 3.9974Z"
          stroke={isDark ? "#fff" : "#000"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );
}
