import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck } from "lucide-react";

export const ChatListItem = () => {
  return (
    <div className="flex px-2 py-3 hover:bg-slate-900">
      {/* Avatar */}
      <div className="w-[60px] flex justify-center items-center">
        <Avatar className="h-15 w-15">
          <AvatarImage src="" alt="Nhom" />
          <AvatarFallback className="bg-purple-400 text-white text-xl font-bold">
            N
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Info */}
      <div className="flex-1 ps-3">
        <h1 className="font-semibold text-base">Nhóm</h1>
        <p className="text-sm text-muted-foreground">Group created</p>
      </div>
      {/* Time & Status */}
      <div className="flex gap-1 text-sm">
        <CheckCheck className="h-4 w-4 text-blue-600" />
        <span className="text-muted-foreground">10:20</span>
      </div>
    </div>
  );
};
