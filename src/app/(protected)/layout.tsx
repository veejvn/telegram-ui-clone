// src/app/(protected)/layout.tsx
import ProtectedClientLayout from './ProtectedClientLayout.client';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Đây là server component, không import matrix-js-sdk
  return <ProtectedClientLayout>{children}</ProtectedClientLayout>;
}
