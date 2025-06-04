import React from "react";
import ChatMessage from "./ChatMessage";

const ChatMessages = () => {
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="py-1.5">
          {i % 4 === 0 && (
            <div className="text-center text-sm">
              <p
                className=" bg-gray-500/10 rounded-full backdrop-blur-sm 
            text-white inline-block px-1.5"
              >
                Today
              </p>
            </div>
          )}
          <ChatMessage
            index={i}
            text={
              i % 4 === 0
                ? "Do you have a website?"
                : i % 3 === 0
                ? "Sure! We have over 150+ templates fully customizable any project Lorem Ipsum is simply "
                : "Yes, here's the link to it 🌍"
            }
            isSender={i % 2 === 0} // cho luân phiên người gửi
          />
        </div>
      ))}
    </>
  );
};

export default ChatMessages;
