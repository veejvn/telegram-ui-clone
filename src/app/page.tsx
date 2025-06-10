"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function Home() {
  const isLogging = useAuthStore((state) => state.isLogging);
  const router = useRouter();

  useEffect(() => {
    if (isLogging) {
      router.replace(ROUTES.CHAT);
    } else {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLogging, router]);

  return null;
}
