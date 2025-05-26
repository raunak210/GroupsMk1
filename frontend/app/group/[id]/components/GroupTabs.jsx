"use client";
import React, { useEffect, useState } from "react";
import MuiTab from "@/components/MuiTab";
import Members from "./Members";
import CustomRoles from "./CustomRoles";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1069/";

const GroupTabs = ({ groupId, groupData, setRefresh }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const { user } = useAuth();

  const tabData = groupData.members?.map((mem) => mem._id).includes(user._id)
    ? [
        {
          heading: "Members",
          component: (
            <Members
              groupId={groupId}
              groupData={groupData}
              permissions={userPermissions}
              setRefresh={setRefresh}
            />
          ),
        },
        {
          heading: "Roles",
          component: (
            <CustomRoles
              groupId={groupId}
              groupData={groupData}
              permissions={userPermissions}
              setRefresh={setRefresh}
            />
          ),
        },
      ]
    : [
        {
          heading: "no permissions",
          component: (
            <div className="flex justify-center items-center ">
              <p className="text-gray-500 text-lg">
                You do not have permissions to view this group
              </p>
            </div>
          ),
        },
      ];

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}api/groups/getPermissions/${groupId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUserPermissions(data.permissions);
      } else {
        console.error("Failed to fetch user permissions:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  return (
    <div>
      <MuiTab tabs={tabData} />
    </div>
  );
};

export default GroupTabs;
