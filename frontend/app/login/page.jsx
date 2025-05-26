"use client";

import React, { useEffect } from "react";
import MuiTab from "../../components/MuiTab";
import Login from "./components/login";
import Signup from "./components/signup";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const tabData = [
  { heading: "Login", component: <Login /> },
  { heading: "Signup", component: <Signup /> },
];

const page = () => {
  const { checkAuth, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const res = await checkAuth();
        if (res) router.push("/");
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkUserAuth();
  }, []);

  return <MuiTab tabs={tabData} />;
};

export default page;
