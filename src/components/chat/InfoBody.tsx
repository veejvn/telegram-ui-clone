import React from "react";
import { Separator } from "../ui/separator";
import * as sdk from "matrix-js-sdk";

export default function InfoBody({ user }: { user: sdk.User }) {
  return (
    <>
      <div className="text-center px-4">
        <p className="text-xl font-semibold">{user.displayName}</p>

        {/* add user's presence */}
        <p className="text-sm text-muted-foreground">last seen 27/02/25</p>

        {/* features */}
        <div className="flex justify-center gap-2 my-4">
          {/* call */}
          <div
            className="flex flex-col justify-end gap-0.5 items-center 
             w-[75px] h-[50px] cursor-pointer      
          bg-white rounded-lg py-1 group"
          >
            <svg
              width="18px"
              height="18px"
              viewBox="0 0 15 15"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              fill="#000000"
              className="group-hover:scale-110 
              duration-500 transition-all ease-in-out 
              group-hover:opacity-70"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>call [#155dfc192]</title>
                <desc>Created with Sketch.</desc> <defs> </defs>
                <g
                  id="Page-1"
                  stroke="none"
                  strokeWidth="1"
                  fill="none"
                  fillRule="evenodd"
                >
                  <g
                    id="Dribbble-Light-Preview"
                    transform="translate(-103.000000, -7321.000000)"
                    fill="#155dfc"
                  >
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path
                        d="M61.7302966,7173.99596 C61.2672966,7175.40296 59.4532966,7176.10496 58.1572966,7175.98796 C56.3872966,7175.82796 54.4612966,7174.88896 52.9992966,7173.85496 C50.8502966,7172.33496 48.8372966,7169.98396 47.6642966,7167.48896 C46.8352966,7165.72596 46.6492966,7163.55796 47.8822966,7161.95096 C48.3382966,7161.35696 48.8312966,7161.03996 49.5722966,7161.00296 C50.6002966,7160.95296 50.7442966,7161.54096 51.0972966,7162.45696 C51.3602966,7163.14196 51.7112966,7163.84096 51.9072966,7164.55096 C52.2742966,7165.87596 50.9912966,7165.93096 50.8292966,7167.01396 C50.7282966,7167.69696 51.5562966,7168.61296 51.9302966,7169.09996 C52.6632966,7170.05396 53.5442966,7170.87696 54.5382966,7171.50296 C55.1072966,7171.86196 56.0262966,7172.50896 56.6782966,7172.15196 C57.6822966,7171.60196 57.5872966,7169.90896 58.9912966,7170.48196 C59.7182966,7170.77796 60.4222966,7171.20496 61.1162966,7171.57896 C62.1892966,7172.15596 62.1392966,7172.75396 61.7302966,7173.99596 C61.4242966,7174.92396 62.0362966,7173.06796 61.7302966,7173.99596"
                        id="call-[#155dfc192]"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            <p className="text-xs text-[#155dfc]">call</p>
          </div>

          {/* video */}
          <div
            className="flex flex-col justify-end items-center
             w-[75px] h-[50px] cursor-pointer     
          bg-white rounded-lg py-1 group"
          >
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 1024 1024"
              className="icon group-hover:scale-110 
              duration-500 transition-all ease-in-out 
              group-hover:opacity-70"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M170.666667 256h469.333333c46.933333 0 85.333333 38.4 85.333333 85.333333v341.333334c0 46.933333-38.4 85.333333-85.333333 85.333333H170.666667c-46.933333 0-85.333333-38.4-85.333334-85.333333V341.333333c0-46.933333 38.4-85.333333 85.333334-85.333333z"
                  fill="#155dfc"
                ></path>
                <path
                  d="M938.666667 746.666667l-213.333334-128V405.333333l213.333334-128z"
                  fill="#155dfc"
                ></path>
              </g>
            </svg>
            <p className="text-xs text-[#155dfc]">video</p>
          </div>

          {/* mute */}
          <div
            className="flex flex-col justify-end items-center 
             w-[75px] h-[50px] group cursor-pointer  
          bg-white rounded-lg  py-1"
          >
            <svg
              fill="#155dfc"
              width="20px"
              height="20px"
              viewBox="0 0 56 56"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:scale-110 
              duration-500 transition-all ease-in-out 
              group-hover:opacity-70"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M 9.4257 43.2461 L 46.5742 43.2461 C 48.8005 43.2461 50.1133 42.0977 50.1133 40.4102 C 50.1133 38.0664 47.7460 35.9570 45.7070 33.8711 C 44.1601 32.2539 43.7382 28.9258 43.5742 26.2305 C 43.3867 17.2305 41.0195 11.0195 34.7617 8.7695 C 33.8945 5.7226 31.4570 3.2852 28.0117 3.2852 C 24.5429 3.2852 22.1289 5.7226 21.2382 8.7695 C 15.0039 11.0195 12.6132 17.2305 12.4492 26.2305 C 12.2617 28.9258 11.8632 32.2539 10.2929 33.8711 C 8.2773 35.9570 5.8867 38.0664 5.8867 40.4102 C 5.8867 42.0977 7.2226 43.2461 9.4257 43.2461 Z M 20.8632 46.4336 C 21.1445 49.8555 24.0273 52.7148 28.0117 52.7148 C 31.9726 52.7148 34.8554 49.8555 35.1601 46.4336 Z"></path>
              </g>
            </svg>
            <p className="text-xs text-[#155dfc]">mute</p>
          </div>

          {/* search */}
          <div
            className="flex flex-col justify-end items-center
            group cursor-pointer
          bg-white rounded-lg  w-[75px] h-[50px] py-1"
          >
            <svg
              width="22px"
              height="22px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#155dfc"
              className="group-hover:scale-110 
              duration-500 transition-all ease-in-out 
              group-hover:opacity-70"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="#155dfc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
            <p className="text-xs text-[#155dfc]">search</p>
          </div>

          {/* more */}
          <div
            className="flex flex-col justify-end items-center 
            group cursor-pointer
          bg-white rounded-lg  w-[75px] h-[50px] py-1"
          >
            <svg
              fill="#155dfc"
              width="25px"
              height="25px"
              viewBox="0 0 32 32"
              enableBackground="new 0 0 32 32"
              id="Glyph"
              version="1.1"
              xmlSpace="preserve"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="group-hover:scale-110 
              duration-500 transition-all ease-in-out 
              group-hover:opacity-70"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M16,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S17.654,13,16,13z"
                  id="XMLID_287_"
                ></path>
                <path
                  d="M6,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S7.654,13,6,13z"
                  id="XMLID_289_"
                ></path>
                <path
                  d="M26,13c-1.654,0-3,1.346-3,3s1.346,3,3,3s3-1.346,3-3S27.654,13,26,13z"
                  id="XMLID_291_"
                ></path>
              </g>
            </svg>
            <p className="text-xs text-[#155dfc]">more</p>
          </div>
        </div>

        {/* more info */}
        <div
          className="bg-white ps-5 text-start py-4 flex flex-col mt-7
        rounded-lg gap-3"
        >
          {/* phone */}
          <div>
            <p className="text-sm">mobile</p>
            <p className="text-[#155dfc]">+84 11 222 33 44</p>
          </div>

          <Separator />

          {/* username */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-ms">username</p>
              <p className="text-[#155dfc]">
                {/* {user.userId.split(":")[0].slice(1)} */}
                {user.userId}
              </p>
            </div>
            <svg
              id="svg2"
              viewBox="0 -50 350 500"
              className="w-20 h-12 hover:scale-110 
              duration-500 transition-all ease-in-out hover:opacity-70
              cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
            >
              <desc>Source: openclipart.org/detail/209545</desc>
              <defs>
                {/* Removed bx:export and bx:file elements as they are not valid JSX/SVG */}
              </defs>
              <g
                id="svg-1"
                transform="matrix(1, 0, 0, 1, -269.030308, -122.494593)"
              >
                <desc>Source: openclipart.org/detail/209545</desc>
                <rect
                  y="222.495"
                  width="100"
                  height="100"
                  rx="15"
                  ry="15"
                  style={{
                    paintOrder: "fill",
                    fill: "transparent",
                    stroke: "rgb(21, 93, 252)",
                    strokeWidth: "10px",
                  }}
                  x="369.03"
                  id="object-0"
                />
                <rect
                  y="222.495"
                  width="100"
                  height="100"
                  rx="15"
                  ry="15"
                  style={{
                    paintOrder: "fill",
                    fill: "transparent",
                    stroke: "rgb(21, 93, 252)",
                    strokeWidth: "10px",
                  }}
                  x="499.03"
                  id="object-1"
                />
                <rect
                  y="352.495"
                  width="100"
                  height="100"
                  rx="15"
                  ry="15"
                  style={{
                    paintOrder: "fill",
                    fill: "transparent",
                    stroke: "rgb(21, 93, 252)",
                    strokeWidth: "10px",
                  }}
                  x="369.03"
                  id="object-2"
                />
                <rect
                  x="499.03"
                  y="352.495"
                  width="30"
                  height="30"
                  style={{
                    stroke: "rgb(0, 0, 0)",
                    fill: "rgb(21, 93, 252)",
                    paintOrder: "stroke",
                    strokeOpacity: 0,
                    strokeWidth: 1,
                  }}
                  id="object-3"
                />
                <rect
                  x="574.03"
                  y="352.495"
                  width="30"
                  height="30"
                  style={{
                    stroke: "rgb(0, 0, 0)",
                    fill: "rgb(21, 93, 252)",
                    paintOrder: "stroke",
                    strokeOpacity: 0,
                    strokeWidth: 1,
                  }}
                  id="object-4"
                />
                <rect
                  x="499.03"
                  y="427.495"
                  width="30"
                  height="30"
                  style={{
                    stroke: "rgb(0, 0, 0)",
                    fill: "rgb(21, 93, 252)",
                    paintOrder: "stroke",
                    strokeOpacity: 0,
                    strokeWidth: 1,
                  }}
                  id="object-5"
                />
                <rect
                  x="574.03"
                  y="427.495"
                  width="30"
                  height="30"
                  style={{
                    stroke: "rgb(0, 0, 0)",
                    fill: "rgb(21, 93, 252)",
                    paintOrder: "stroke",
                    strokeOpacity: 0,
                    strokeWidth: 1,
                  }}
                  id="object-6"
                />
                <rect
                  x="536.03"
                  y="392.495"
                  width="30"
                  height="30"
                  style={{
                    stroke: "rgb(0, 0, 0)",
                    fill: "rgb(21, 93, 252)",
                    paintOrder: "stroke",
                    strokeOpacity: 0,
                    strokeWidth: 1,
                  }}
                  id="object-7"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
