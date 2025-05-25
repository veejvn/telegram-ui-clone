import { Fragment } from "react";

const SettingPage = () => {
  return (
    <Fragment>
      <div className="bg-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-blue-500">QR</span>
          <h1 className="text-lg font-semibold">Setting</h1>
          <div className="flex gap-3">
            <div className="text-blue-500">Edit</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-sm text-white">My profile</p>
      </div>
    </Fragment>
  );
};

export default SettingPage;
