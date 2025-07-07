import NewMessageClientLayout from "@/components/chat/NewMessageClientLayout";

const NewMessageLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <NewMessageClientLayout>{children}</NewMessageClientLayout>;
};

export default NewMessageLayout;
