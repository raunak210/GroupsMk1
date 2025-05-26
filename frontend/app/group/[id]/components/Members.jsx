"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  setRef,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1069/";

const Members = ({ groupData, groupId, permissions, setRefresh }) => {
  const [members, setMembers] = useState(groupData?.members || []);
  const [allRoles, setAllRoles] = useState(groupData?.customRoles || []);

  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const { user } = useAuth();

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [memberToAssign, setMemberToAssign] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [assignRoleError, setAssignRoleError] = useState("");

  const canManageMembers =
    permissions?.includes("MANAGE_MEMBERS") ||
    groupData?.owner._id === user._id;
  const canManageRoles =
    permissions?.includes("MANAGE_ROLES") || groupData?.owner._id === user._id;

  const handleRemoveClick = (memberId) => {
    setMemberToRemove(memberId);
    setOpenRemoveDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    try {
      const response = await fetch(
        `${BASE_URL}api/groups/removeMemberFromGroup/${groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: memberToRemove }),
        }
      );

      if (response.ok) {
        setMembers((prev) =>
          prev.filter((member) => member._id !== memberToRemove)
        );
        setRefresh((prev) => !prev);
      } else {
        const error = await response.json();
        console.error("Failed to remove member:", error.message);
      }
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setOpenRemoveDialog(false);
      setMemberToRemove(null);
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}api/groups/addMemberToGroup/${groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userDetail: addInput }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setMembers((prev) => [...prev, result.user]);
        setAddInput("");
        setOpenAddDialog(false);
        setErrorMessage("");
        setRefresh((prev) => !prev);
      } else {
        setErrorMessage(result.message || "Failed to add member.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAssignRoleClick = (memberId) => {
    setMemberToAssign(memberId);
    setSelectedRole("");
    setAssignRoleError("");
    setOpenAssignDialog(true);
  };

  const handleConfirmAssignRole = async () => {
    if (!memberToAssign || !selectedRole) return;

    try {
      const response = await fetch(
        `${BASE_URL}api/groups/assignRole/${groupId}/${memberToAssign}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ roleId: selectedRole }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setOpenAssignDialog(false);
        setMemberToAssign(null);
        setSelectedRole("");
        setAssignRoleError("");
        setRefresh((prev) => !prev);
      } else {
        setAssignRoleError(result.message || "Failed to assign role.");
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      setAssignRoleError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded mt-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Group Members</h2>
        {canManageMembers && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddDialog(true)}
          >
            + Add Members
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-gray-500">No members found.</p>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => {
            const memberRoles = groupData.customRoles
              .filter((role) => role.users.includes(member._id))
              .map((role) => role.name);

            const isOwner = member._id === groupData.owner._id;

            return (
              <li
                key={member._id}
                className="flex items-center justify-between flex-wrap gap-4 p-3 border rounded-md"
              >
                {/* Member Info + Roles */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-lg font-medium truncate">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {member.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                    {memberRoles.map((roleName, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {roleName}
                      </span>
                    ))}
                    {isOwner && (
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {member._id != groupData.owner._id && (
                  <div className="flex gap-2 flex-shrink-0">
                    {canManageRoles && user._id !== member._id && (
                      <button
                        onClick={() => handleAssignRoleClick(member._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Assign Role
                      </button>
                    )}
                    {(canManageMembers || user._id === member._id) && (
                      <button
                        onClick={() => handleRemoveClick(member._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        {user._id === member._id ? "Exit" : "Remove"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Remove Dialog */}
      <Dialog
        open={openRemoveDialog}
        onClose={() => setOpenRemoveDialog(false)}
      >
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this member?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the email or user ID of the member you want to add.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email or User ID"
            fullWidth
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
          />
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
      >
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a role to assign to this member.
          </DialogContentText>
          <TextField
            select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            SelectProps={{ native: true }}
            margin="normal"
          >
            <option value="">Select a role</option>
            {allRoles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </TextField>
          {assignRoleError && (
            <p className="text-red-500 text-sm mt-2">{assignRoleError}</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAssignRole}
            variant="contained"
            color="primary"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Members;
