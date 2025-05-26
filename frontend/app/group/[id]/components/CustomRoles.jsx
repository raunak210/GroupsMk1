"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:1069/";

const PERMISSIONS = [
  { label: "Manage Members", value: "MANAGE_MEMBERS" },
  { label: "View Group Info", value: "VIEW_GROUP_INFO" },
  { label: "Manage Roles", value: "MANAGE_ROLES" },
  { label: "Approve Requests", value: "APPROVE_REQUESTS" },
];

const CustomRoles = ({ groupId, groupData, permissions, setRefresh }) => {
  const [open, setOpen] = useState(false);
  const [allRoles, setAllRoles] = useState(groupData.customRoles || []);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const canManageRoles =
    permissions?.includes("MANAGE_ROLES") || groupData?.owner._id === user._id;

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((perm) => perm !== permission)
        : [...prev, permission]
    );
  };

  const handleCreateCustomRole = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}api/groups/createCustomRole/${groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: roleName,
            permissions: selectedPermissions,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to create custom role.");
        return;
      }

      setAllRoles((prev) => [...prev, result.role]);
      setRoleName("");
      setSelectedPermissions([]);
      setErrorMessage("");
      setRefresh((prev) => !prev);
      setOpen(false);
    } catch (error) {
      console.log("Error creating custom role:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const confirmDeleteRole = (role) => {
    setRoleToDelete(role);
    setDeleteConfirmOpen(true);
  };

  const handleRemoveRole = async () => {
    if (!roleToDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}api/groups/deleteCustomRole/${groupId}/${roleToDelete._id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing role:", errorData.message);
        return;
      }

      setAllRoles((prev) =>
        prev.filter((role) => role._id !== roleToDelete._id)
      );
      setRoleToDelete(null);
      setRefresh((prev) => !prev);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error removing role:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Custom Roles</h2>
        {canManageRoles && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
          >
            + Create Custom Role
          </Button>
        )}
      </div>

      {/* List of roles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allRoles.length === 0 ? (
          <p className="text-gray-500 col-span-full">No custom roles found.</p>
        ) : (
          allRoles.map((role) => (
            <div
              key={role._id}
              className="border rounded-lg p-4 shadow-sm flex justify-between items-start"
            >
              <div>
                <h3 className="text-lg font-bold mb-2">{role.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => {
                    const label =
                      PERMISSIONS.find((p) => p.value === perm)?.label || perm;
                    return (
                      <Chip
                        key={perm}
                        label={label}
                        color="primary"
                        size="small"
                      />
                    );
                  })}
                </div>
              </div>
              {canManageRoles && (
                <Tooltip title="Delete Role">
                  <IconButton
                    onClick={() => confirmDeleteRole(role)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Role Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Custom Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            margin="normal"
          />

          <FormGroup>
            {PERMISSIONS.map((perm) => (
              <FormControlLabel
                key={perm.value}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(perm.value)}
                    onChange={() => handlePermissionToggle(perm.value)}
                  />
                }
                label={perm.label}
              />
            ))}
          </FormGroup>

          {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCustomRole}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role{" "}
            <strong>{roleToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRemoveRole}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomRoles;
