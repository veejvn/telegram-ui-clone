"use client";

import { getLS } from "@/tools/localStorage.tool";
import { useRouter } from "next/navigation";

const ContactClientLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const route = useRouter()
  const fromMainApp = getLS("fromMainApp")
  const hide = getLS("hide") || [];
  const options = Array.isArray(hide) && fromMainApp ? hide : [];

  if(options.includes("contact")){
    route.push("/chat")
  }

  return <div>{children}</div>;
};

export default ContactClientLayout;
