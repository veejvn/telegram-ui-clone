<<<<<<< HEAD
// src/app/(protected)/layout.tsx
import ProtectedClientLayout from './ProtectedClientLayout.client';
=======
"use client";
import React, { useEffect, useState} from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BottomNavigattion from "@/components/layouts/BottomNavigation";
import { MatrixClientProvider } from "@/contexts/MatrixClientProvider";
>>>>>>> 63ff68dd67bfe39f4b7a7c4bfe8ad19fa282377a

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Đây là server component, không import matrix-js-sdk
  return <ProtectedClientLayout>{children}</ProtectedClientLayout>;
}
