"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1069/";

const SidebarLayout = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { user, logout, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setGroups(user?.groups || []);
  }, [user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}api/groups/createGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating group:", errorData.message);
        return;
      }

      const data = await response.json();
      setGroups((prev) => [...prev, data.group]);
      setName("");
      setDescription("");
      checkAuth();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActiveGroup = (groupId) => pathname === `/group/${groupId}`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 p-4 bg-gray-100 border-r flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
          <ul className="space-y-2 mb-4">
            {groups.length > 0 ? (
              groups.map((group) => (
                <li
                  key={group._id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    isActiveGroup(group._id)
                      ? "bg-blue-100 font-semibold text-blue-700"
                      : "bg-white hover:bg-gray-200"
                  }`}
                  onClick={() => router.push(`/group/${group._id}`)}
                >
                  <GroupIcon className="text-gray-600" fontSize="small" />
                  <span className="truncate">{group.name}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No groups found</p>
            )}
          </ul>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Create Group
          </button>
          {/* Logout button */}

          <button
            onClick={handleLogout}
            className="flex items-center mt-6 gap-2 w-full p-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded"
          >
            <LogoutIcon fontSize="small" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <input
                type="text"
                placeholder="Group Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarLayout;
