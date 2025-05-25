import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="px-4 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search"
          className="pl-10 bg-[#0f0f0f] text-white border-none rounded-xl"
        />
      </div>
    </div>
  );
}
