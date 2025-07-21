// chat/icons/InfoIcons.tsx

import React from "react";

export const CallIcon = () => (
  <svg
    width="18px"
    height="18px"
    viewBox="0 0 24 24"
    fill="#155dfc"
    stroke="#155dfc"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group-hover:scale-110 duration-500 transition-all ease-in-out group-hover:opacity-70"
  >
    <path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a1 1 0 0 1 1 .75l1.13 4.52a1 1 0 0 1-.29 1L9.91 11.09a16 16 0 0 0 6 6l1.82-1.82a1 1 0 0 1 1-.29l4.52 1.13a1 1 0 0 1 .75 1z"/>
  </svg>
);

export const VideoIcon = () => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    fill="#000000"
    className="group-hover:scale-110 duration-500 transition-all ease-in-out group-hover:opacity-70"
  >
    <path
      d="M170.666667 256h469.333333c46.933333 0 85.333333 38.4 85.333333 85.333333v341.333334c0 46.933333-38.4 85.333333-85.333333 85.333333H170.666667c-46.933333 0-85.333333-38.4-85.333334-85.333333V341.333333c0-46.933333 38.4-85.333333 85.333334-85.333333z"
      fill="#155dfc"
    />
    <path
      d="M938.666667 746.666667l-213.333334-128V405.333333l213.333334-128z"
      fill="#155dfc"
    />
  </svg>
);

export const MuteIcon = () => (
  <svg
    fill="#155dfc"
    width="20px"
    height="20px"
    viewBox="0 0 56 56"
    xmlns="http://www.w3.org/2000/svg"
    className="group-hover:scale-110 duration-500 transition-all ease-in-out group-hover:opacity-70"
  >
    <path d="M 9.4257 43.2461 L 46.5742 43.2461 C 48.8005 43.2461 50.1133 42.0977 50.1133 40.4102 C 50.1133 38.0664 47.7460 35.9570 45.7070 33.8711 C 44.1601 32.2539 43.7382 28.9258 43.5742 26.2305 C 43.3867 17.2305 41.0195 11.0195 34.7617 8.7695 C 33.8945 5.7226 31.4570 3.2852 28.0117 3.2852 C 24.5429 3.2852 22.1289 5.7226 21.2382 8.7695 C 15.0039 11.0195 12.6132 17.2305 12.4492 26.2305 C 12.2617 28.9258 11.8632 32.2539 10.2929 33.8711 C 8.2773 35.9570 5.8867 38.0664 5.8867 40.4102 C 5.8867 42.0977 7.2226 43.2461 9.4257 43.2461 Z M 20.8632 46.4336 C 21.1445 49.8555 24.0273 52.7148 28.0117 52.7148 C 31.9726 52.7148 34.8554 49.8555 35.1601 46.4336 Z" />
  </svg>
);

export const SearchIcon = () => (
  <svg
    width="22px"
    height="22px"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#155dfc"
    xmlns="http://www.w3.org/2000/svg"
    className="group-hover:scale-110 duration-500 transition-all ease-in-out group-hover:opacity-70"
  >
    <path
      d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MoreIcon = () => (
  <svg
    fill="#155dfc"
    width="25px"
    height="25px"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    className="group-hover:scale-110 duration-500 transition-all ease-in-out group-hover:opacity-70"
  >
    <path d="M16,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S17.654,13,16,13z" />
    <path d="M6,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S7.654,13,6,13z" />
    <path d="M26,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S27.654,13,26,13z" />
  </svg>
);

export const BellMutedIcon = () => (
  <svg
    width="20px"
    height="20px"
    viewBox="0 0 56 56"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chuông màu xanh */}
    <path
      fill="#155dfc"
      d="M 9.4257 43.2461 L 46.5742 43.2461 C 48.8005 43.2461 50.1133 42.0977 50.1133 40.4102 C 50.1133 38.0664 47.7460 35.9570 45.7070 33.8711 C 44.1601 32.2539 43.7382 28.9258 43.5742 26.2305 C 43.3867 17.2305 41.0195 11.0195 34.7617 8.7695 C 33.8945 5.7226 31.4570 3.2852 28.0117 3.2852 C 24.5429 3.2852 22.1289 5.7226 21.2382 8.7695 C 15.0039 11.0195 12.6132 17.2305 12.4492 26.2305 C 12.2617 28.9258 11.8632 32.2539 10.2929 33.8711 C 8.2773 35.9570 5.8867 38.0664 5.8867 40.4102 C 5.8867 42.0977 7.2226 43.2461 9.4257 43.2461 Z M 20.8632 46.4336 C 21.1445 49.8555 24.0273 52.7148 28.0117 52.7148 C 31.9726 52.7148 34.8554 49.8555 35.1601 46.4336 Z"
    />

    {/* Đường chéo màu xanh) */}
    <line
      x1="10"
      y1="10"
      x2="46"
      y2="46"
      stroke="#155dfc"
      strokeWidth="4"
      strokeLinecap="round"
    />

    {/* Đường chéo màu trắng */}
    <line
      x1="10"
      y1="10"
      x2="46"
      y2="46"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);
