import React from "react";
import FaviconOrInitial from "./FaviconOrInital";

interface Props {
  url: string;
  title?: string;
}

const LinkCard: React.FC<Props> = ({ url }) => {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = url;
  }

  const displayTitle =
    hostname.charAt(0).toUpperCase() + hostname.slice(1).toLowerCase();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
    >
      {/* Icon cố định chiều rộng để các dòng đều nhau */}
      <div className="w-10 min-w-10 h-10 mr-3 flex items-center justify-center">
        <FaviconOrInitial url={url} siteName={hostname} />
      </div>

      {/* Phần content: chiếm toàn bộ phần còn lại và hiển thị đều */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <p className="text-sm font-medium text-black dark:text-white leading-tight truncate text-left">
          {displayTitle}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-left">
          {url}
        </p>
      </div>
    </a>
  );
};

export default LinkCard;
