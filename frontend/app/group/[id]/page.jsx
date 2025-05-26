"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import GroupTabs from "./components/GroupTabs";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1069/";

const GroupPage = () => {
  const { id } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const { user } = useAuth();

  const fetchGroupById = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}api/groups/getGroup${
          user.groups?.map((grp) => grp._id).includes(id) ? "" : "Basic"
        }Info/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching group:", errorData.message);
        return;
      }

      const data = await response.json();
      setGroupData(data);
    } catch (error) {
      console.error("Failed to fetch group:", error);
    }
  };

  useEffect(() => {
    fetchGroupById();
  }, [refresh]);

  if (!groupData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading group information...</p>
      </div>
    );
  }

  const { name, memberCount, owner } = groupData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Group Header */}
      <div className="w-full bg-blue-600 text-white py-12 px-6 text-center shadow-md">
        <h1 className="text-4xl font-bold">{name}</h1>
        <p className="text-lg mt-2">Group ID: {id}</p>
      </div>

      {/* Group Info Section */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Group Information
        </h2>

        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Group Name</h3>
              <p className="text-gray-900 text-lg">{name}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700">
                Member Count
              </h3>
              <p className="text-gray-900 text-lg">
                {groupData?.members?.length || groupData?.memberCount || 0}
              </p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-700">Owner</h3>
              <div className="p-4 bg-gray-100 rounded-md">
                <p className="text-gray-800">
                  <strong>Name:</strong> {owner?.name}
                </p>
                <p className="text-gray-800">
                  <strong>Email:</strong> {owner?.email}
                </p>
                <p className="text-gray-800">
                  <strong>ID:</strong> {owner?._id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Created:</strong>{" "}
                  {new Date(owner?.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for tabs or additional group content */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Group Sections
          </h2>
          {/* <div className="border-t pt-4 text-gray-500">Tabs coming soon...</div> */}
          <GroupTabs
            groupId={id}
            groupData={groupData}
            setRefresh={setRefresh}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
