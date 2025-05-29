import { Separator } from "@/components/ui/ChatSeparator";
import { ChatListItem } from "./ChatListItem";
import Link from "next/link";

export const ChatList = () => {
  const id = 11222;
  return (
    <>
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="w-[calc(100%-72px)] ml-[72px] opacity-30" />
      <Link href={`/chat/${id}`}>
        <ChatListItem />
      </Link>
      <Separator className="opacity-30" />
    </>
  );
};
