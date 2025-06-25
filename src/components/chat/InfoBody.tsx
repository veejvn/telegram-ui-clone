import React from "react";
import { Separator } from "../ui/separator";
import * as sdk from "matrix-js-sdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Ellipsis, Hand, Phone, Search, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function InfoBody({ user }: { user: sdk.User }) {
  const mediaItems = [
    {
      id: 1,
      name: 'Youtube',
      url: 'http://youtube.com',
      icon: 'Y',
      bgColor: 'bg-gray-100'
    },
    {
      id: 2,
      name: 'Google',
      url: 'http://google.com',
      icon: 'G',
      bgColor: 'bg-gray-100'
    },
    {
      id: 3,
      name: 'Matrix',
      url: 'http://Matrix.org',
      icon: 'M',
      bgColor: 'bg-gray-100'
    }
  ];
  return (
    <>
      <div className="text-center px-4">
        <p className="text-xl font-semibold">{user.displayName}</p>

        {/* add user's presence */}
        <p className="text-sm text-muted-foreground">last seen 27/02/25</p>

        {/* features */}
        <div className="flex justify-center gap-2 my-4">
          {/* call */}
          <div
            className="flex flex-col justify-end gap-0.5 items-center 
             w-[75px] h-[50px] cursor-pointer      
          bg-white rounded-lg py-1 group"
          >
            <Phone className="text-[#155dfc]"/>
            <p className="text-xs text-[#155dfc]">call</p>
          </div>

          {/* video */}
          <div
            className="flex flex-col justify-end items-center
             w-[75px] h-[50px] cursor-pointer     
          bg-white rounded-lg py-1 group"
          >
            <Video className="text-[#155dfc]"/>
            <p className="text-xs text-[#155dfc]">video</p>
          </div>

          {/* mute */}
          <div
            className="flex flex-col justify-end items-center 
             w-[75px] h-[50px] group cursor-pointer  
          bg-white rounded-lg  py-1"
          >
            <Bell className="text-[#155dfc]"/>
            <p className="text-xs text-[#155dfc]">mute</p>
          </div>

          {/* search */}
          <div
            className="flex flex-col justify-end items-center
            group cursor-pointer
          bg-white rounded-lg  w-[75px] h-[50px] py-1"
          >
            <Search className="text-[#155dfc]"/>
            <p className="text-xs text-[#155dfc]">search</p>
          </div>

          {/* more */}
          <Popover>
            <PopoverTrigger>
              <div
                className="flex flex-col justify-end items-center 
                group cursor-pointer
              bg-white rounded-lg  w-[75px] h-[50px] py-1"
              >
                <Ellipsis className="text-[#155dfc]" />
                <p className="text-xs text-[#155dfc]">more</p>
              </div>
            </PopoverTrigger>
            <PopoverContent className="mr-4 p-0 w-[240px]">
              <div className="">
                <Button className="flex justify-between items-center w-full my-1 text-red-500 bg-white dark:bg-black">
                  Block User
                  <Hand/>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* more info */}
        <div className="bg-white ps-5 text-start py-4 flex flex-col mt-7 rounded-lg gap-3">
          {/* phone */}
          <div>
            <p className="text-sm">mobile</p>
            <p className="text-[#155dfc]">+84 11 222 33 44</p>
          </div>
        </div>

        <div className="text-start py-4 flex flex-col rounded-lg gap-3">
          <Tabs defaultValue="media">
            <TabsList className="w-full h-12">
              <TabsTrigger value="media" className="data-[state=active]:text-[#155dfc] text-zinc-500">Media</TabsTrigger>
              <TabsTrigger value="link" className="data-[state=active]:text-[#155dfc] text-zinc-500">Links</TabsTrigger>
            </TabsList>
            <TabsContent value="media">
              <div className="grid grid-cols-3 gap-0.5 bg-white p-1 rounded-lg">
                <div className="">
                  <Image src="/images/folder.png" alt="image" width={500} height={500}></Image>
                </div>
                <div>
                  <Image src="/images/contact.png" alt="image" width={500} height={500}></Image>
                </div>
                <div>
                  <Image src="/images/logo.png" alt="image" width={500} height={500}></Image>
                </div>
                <div>
                  <Image src="/images/logo.png" alt="image" width={500} height={500}></Image>
                </div>
                <div>
                  <Image src="/images/contact.png" alt="image" width={500} height={500}></Image>
                </div>
                 <div>
                  <Image src="/images/folder.png" alt="image" width={500} height={500}></Image>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="link">
              <Card className="w-full max-w-md mx-auto bg-white shadow-sm pt-3 pb-0">
                <CardContent className="px-2">
                  {/* Media Items */}
                  <div className="space-y-4">
                    {mediaItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                          <span className="text-gray-600 font-semibold text-lg">
                            {item.icon}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium text-sm">
                            {item.name}
                          </span>
                          <a 
                            href={item.url}
                            className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.url}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
