"use client";

import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import { Check, CheckCheck, MapPin } from "lucide-react";
import { useState } from "react";

export function LocationMessage({ msg, isSender }: MessagePros) {
  const { location } = msg;
  const [isImgLoading, setIsImgLoading] = useState(true);
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${location?.latitude},${location?.longitude}`;
  const textClass = clsx(
    "flex items-center gap-1 text-xs",
    isSender ? "text-white justify-end" : "text-white"
  );

  return (
    <div className={`rounded-lg py-2`}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-xl", // Đảm bảo tail căn đáy với bubble
          isSender ? "ml-auto" : "mr-auto"
        )}
      >
        <div className="h-40 w-80 rounded-2xl overflow-hidden shadow relative bg-white">
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            //className="flex"
          >
            {isImgLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                {/* Spinner hoặc text loading */}
                <span className="">Loading...</span>
              </div>
            )}
            <img
              src={`/chat/api/map-static?lat=${location?.latitude}&lng=${location?.longitude}`}
              alt="image"
              className="h-40 w-80 rounded-2xl"
              onLoad={() => setIsImgLoading(false)}
              onError={() => setIsImgLoading(false)}
              style={isImgLoading ? { visibility: "hidden" } : {}}
            />
            {/* <div className="h-40 w-80 rounded-2xl flex justify-center items-center">
              <MapPin className="size-20 text-white" />
            </div> */}
          </a>
          {msg.time && (
            <div
              className={`absolute bottom-1 bg-z text-zinc-500 text-xs px-2 py-1 rounded-full ${
                isSender ? "left-2" : "right-2"
              }`}
            >
              {formatMsgTime(msg.time)}
            </div>
          )}
          {isSender && (
            <div className="absolute bottom-1 right-2">
              <div className={textClass}>
                <p
                  className="backdrop-blur-sm backdrop-brightness-70 overflow-hidden items-center px-2 py-0.5 mt-2 flex gap-1 rounded-full"
                >
                  {msg.status === "read" ? (
                    <CheckCheck size={14} />
                  ) : (
                    <Check size={14} />
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
