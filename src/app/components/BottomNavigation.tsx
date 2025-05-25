import Link from "next/link";

const BottomNavigattion = () => {
  return (
    <div className="border-t border-gray-700 flex justify-around items-center py-2 bg-[#1c1c1e] text-gray-400">
      <Link href={"/contact"}>
        <div className="flex flex-col items-center">
          <span className="relative">
            👤
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              !
            </span>
          </span>
          <span className="text-xs">Contacts</span>
        </div>
      </Link>
      <Link href={"/call"}>
        <div className="flex flex-col items-center">
          📞
          <span className="text-xs">Calls</span>
        </div>
      </Link>
      <Link href={"/chat"}>
        <div className="flex flex-col items-center">
          💬
          <span className="text-xs">Chats</span>
        </div>
      </Link>
      <Link href={"/setting"}>
        <div className="flex flex-col items-center">
          ⚙️
          <span className="text-xs">Settings</span>
        </div>
      </Link>
    </div>
  );
};

export default BottomNavigattion;
