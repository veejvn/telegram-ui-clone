// src/app/(protected)/call/layout.tsx

import CallClientLayout from "@/components/call/CallClientLayout";


export default function CallLayout({ children }: { children: React.ReactNode }) {

  return <CallClientLayout>{children}</CallClientLayout>;
}
