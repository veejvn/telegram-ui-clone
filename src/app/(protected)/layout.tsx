import React from "react";
import ProtectedClientLayout from "../../components/layouts/ProtectedClientLayout";
import AuthTokenHandler from "@/components/auth/AuthTokenHandler";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedClientLayout>{children}</ProtectedClientLayout>;
}
