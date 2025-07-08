import React from "react";
import ProtectedClientLayout from "../../components/layouts/ProtectedClientLayout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedClientLayout>{children}</ProtectedClientLayout>;
}
