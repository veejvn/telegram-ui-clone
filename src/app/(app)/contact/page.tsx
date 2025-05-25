import { Fragment } from "react";
import SearchBar from "@/app/components/SearchBar";

const ContactPage = () => {
  return (
    <Fragment>
      <div className="bg-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-blue-500">Sort</span>
          <h1 className="text-lg font-semibold">Contacts</h1>
          <div className="flex gap-3">
            <div className="text-blue-500">+</div>
          </div>
        </div>
        <SearchBar />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-sm text-white">Access to Contacts</p>
      </div>
    </Fragment>
  );
};

export default ContactPage;
