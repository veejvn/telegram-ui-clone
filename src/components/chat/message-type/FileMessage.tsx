import { Button } from "@/components/ui/button";
import { useDownloadFile } from "@/hooks/useDownloadFile";
import { cn } from "@/lib/utils";
import { MessagePros } from "@/types/chat";
import formatBytes from "@/utils/chat/format/formatBytes";
import { formatMsgTime } from "@/utils/chat/formatMsgTime";
import clsx from "clsx";
import { Check, CheckCheck, Download, File } from "lucide-react";
import { FaFile } from "react-icons/fa6";

const FileMessage = ({ msg, isSender }: MessagePros) => {
  //console.log(msg);
  const { text: fileName, fileUrl, fileInfo } = msg;
  const textClass = clsx(
    "flex items-center justify-end gap-1 text-xs",
    isSender ? "text-[#79c071] dark:text-white" : "text-zinc-400"
  );
  const downloadFile = useDownloadFile();

  return (
    <div
      className={`dark:bg-[#4567fc] w-70 rounded-xl p-2 px-3 max-w-xs flex flex-col shadow-sm select-none self-end ${
        isSender ? "bg-[#dcf8c6]" : "bg-white"
      }`}
    >
      {/* File Content */}
      <div className="flex items-center gap-3 max-w-[260px]">
        <button
          onClick={() => downloadFile(fileUrl || null, fileName)}
          className={`rounded-full dark:bg-white p-3 text-white shrink-0 ${
            isSender ? "bg-[#79c071]" : "bg-[#74b4ec]"
          }`}
          aria-label={`Tải file ${fileName}`}
          title={`Tải file ${fileName}`}
        >
          <FaFile className="dark:text-[#4567fc]" />
        </button>

        <div className="flex-1 text-[#79c071] dark:text-white overflow-hidden">
          <span
            className={`font-medium text-[16px] block break-words ${
              !isSender && "text-[#74b4ec]"
            }`}
            title={fileName}
          >
            {fileName}
          </span>
          <div className={`text-[16px] ${!isSender && "text-zinc-400"}`}>
            {formatBytes(fileInfo?.fileSize || 0)}
          </div>
        </div>
      </div>

      {/* Time & Status */}
      <div className={`${textClass}`}>
        <span className="flex items-center gap-1 text-[11px]">
          {formatMsgTime(msg.time)}
          {isSender &&
            (msg.status === "read" ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            ))}
        </span>
      </div>
    </div>
  );
};

export default FileMessage;
