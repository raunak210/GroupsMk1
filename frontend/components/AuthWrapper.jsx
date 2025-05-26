"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";

export default function AuthWrapper({ children }) {
  const { checkAuth, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return children;

  useEffect(() => {
    // if (!user) return;

    const checkUserAuth = async () => {
      try {
        const res = await checkAuth();
        if (!res) router.push("/login");
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkUserAuth();
  }, []);
  console.log("user", user);
  if (!user) return null;

  return <SideBar>{children}</SideBar>;
}
