"use client"

import * as sdk from "matrix-js-sdk"
import { UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import ContactService from "@/services/contactService";
import { useToast } from "@/contexts/ToastProvider";

type SearchContentProps = {
  loading: boolean;
  searchResults: any[];
};

const SearchContent = ({ loading, searchResults }: SearchContentProps) => {
  if (loading) {
    return (
      <div className="p-4 bg-white text-gray-400 dark:text-gray-500 text-center">
        Đang tìm kiếm...
      </div>
    );
  }
  if (!loading && searchResults.length === 0) {
    return (
      <div className="p-4  bg-white text-gray-400 dark:text-gray-500 text-center">
        Không tìm thấy người dùng nào.
      </div>
    );
  }

  const client = useMatrixClient();
  const { showToast } = useToast();

  const handleAddContact = async (client : sdk.MatrixClient, user_id: string) =>{
    try{
      const room = await ContactService.addContact(client, user_id);
    }catch(error: any){
      showToast(`${error}`, "error");
    }
  } 

  return (
    <div className="max-h-[400px] overflow-y-auto bg-white dark:bg-[#181818] rounded-xl shadow-lg border border-gray-200 dark:border-[#232323] max-w-[1300px] mx-auto">
      {searchResults.map((user, idx) => (
        <div
          key={user.user_id || idx}
          className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232323] transition"
        >
          <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white text-lg">
            {(user.display_name && user.display_name.charAt(0).toUpperCase()) ||
              (user.user_id && user.user_id.charAt(1).toUpperCase()) ||
              "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[140px]">
              {user.display_name || "Không có tên"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {user.user_id}
            </div>
          </div>
          <Button
            onClick={() => client && handleAddContact(client, user.user_id)}
            size="lg"
            className="bg-white hover:bg-zinc-300 text-blue-500"
            disabled={!client}
          >
            <UserRoundPlus />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SearchContent;
