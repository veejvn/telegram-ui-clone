import { BubbleTail } from "@/components/chat/message-type/BubbleTail";
import { MessagePros } from "@/types/chat";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";

export function LocationMessage({ msg, isSender }: MessagePros) {
  const { location } = msg;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${location?.latitude},${location?.longitude}`;

  return (
    <div className={`rounded-lg py-2`}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-xl", // Đảm bảo tail căn đáy với bubble
          isSender ? "ml-auto" : "mr-auto"
        )}
      >
        <div className="h-40 w-80 rounded-2xl overflow-hidden shadow relative bg-[rgb(13,71,161)]">
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="flex">
            <img
              src={`/chat/api/map-static?lat=${location?.latitude}&lng=${location?.longitude}`}
              alt="image"
              className="h-40 w-80 rounded-2xl"
            />
          </a>
          {msg.time && (
            <div className={`absolute bottom-1 bg-[#0d47a1] text-white text-xs px-2 py-1 rounded-full ${isSender ? "left-2" : "right-2"}`}>
              {formatMsgTime(msg.time)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
