import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React, { forwardRef } from "react";

const SearchBar = forwardRef<
  HTMLInputElement,
  { value: string; onChange: (value: string) => void }
>(function SearchBar({ value, onChange }, ref) {
  return (
    <div className="px-4 py-2">
      <div className="relative border rounded-xl bg-white dark:bg-neutral-900">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <Input
          ref={ref}
          type="text"
          placeholder="Search user..."
          className="
              pl-10 border rounded-xl
              bg-white text-black placeholder:text-gray-400
              dark:bg-neutral-900 dark:text-white dark:placeholder:text-gray-400
              focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600
            "
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
});

export default SearchBar;
