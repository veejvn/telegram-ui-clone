import { Fragment } from "react";

const CallPage = () => {
  return (
    <Fragment>
      <div className="bg-[#1a1a1a]">
        <div className="flex items-center justify-center px-4 py-2">
          <h1 className="text-lg font-semibold">Chats</h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-sm text-white">Your recent voice and video call</p>
      </div>
    </Fragment>
  );
};

export default CallPage;
