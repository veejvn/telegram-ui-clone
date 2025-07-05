import CallClientLayout from "@/components/call/CallClientLayout";

const CallLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    return ( 
        <CallClientLayout>
            {children}
        </CallClientLayout>
     );
}
 
export default CallLayout;