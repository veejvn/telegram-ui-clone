"usc client";

import Link from "next/link";
import { CircleUserRound, Phone, MessageCircle, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const BottomNavigattion = () => {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/chat") return pathname?.startsWith("/chat");
    if (href === "/contact") return pathname?.startsWith("/contact");
    if (href === "/call") return pathname?.startsWith("/call");
    if (href === "/setting") return pathname?.startsWith("/setting");
    return false;
  };
  const activeClass = "text-blue-500";
  const inactiveClass = "text-gray-400";
  return (
    <div className="fixed bottom-0 w-full border-t border-gray-400 flex justify-around items-center pt-2 pb-7 bg-white dark:bg-black text-gray-400">
      <Link href="/contact">
        <div className="flex flex-col items-center">
          <span className={`relative ${isActive("/contact") ? activeClass : inactiveClass}`}>
            <CircleUserRound />
          </span>
          <span className={`text-xs ${isActive("/contact") ? activeClass : inactiveClass}`}>Contacts</span>
        </div>
      </Link>
      <Link href="/call">
        <div className="flex flex-col items-center">
          <span className={isActive("/call") ? activeClass : inactiveClass}>
            <Phone />
          </span>
          <span className={`text-xs ${isActive("/call") ? activeClass : inactiveClass}`}>Calls</span>
        </div>
      </Link>
      <Link href="/chat" scroll={false}>
        <div className="flex flex-col items-center">
          <span className={isActive("/chat") ? activeClass : inactiveClass}>
            <MessageCircle />
          </span>
          <span className={`text-xs ${isActive("/chat") ? activeClass : inactiveClass}`}>Chats</span>
        </div>
      </Link>
      <Link href="/setting">
        <div className="flex flex-col items-center">
                    <span className={isActive("/setting") ? activeClass : inactiveClass}>
            <Settings />
          </span>
          <span className={`text-xs ${isActive("/setting") ? activeClass : inactiveClass}`}>Settings</span>
        </div>
      </Link>
    </div>
  );
};

export default BottomNavigattion;
