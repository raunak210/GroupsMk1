const express = require("express");
const {
  getGroupBasicInfo,
  getGroupInfo,
  createGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  createCustomRole,
  deleteCustomRole,
  requestToJoinGroup,
  handleJoinRequest,
  getPermissionsForUser,
  getJoinRequests,
  assignRole,
} = require("../controllers/group.controller");
const { checkAuth } = require("../middleware/user.middleware");
const router = express.Router();

router.get("/getGroupBasicInfo/:id", getGroupBasicInfo); //
router.get("/getGroupInfo/:id", getGroupInfo);
router.post("/createGroup", checkAuth, createGroup); //
router.post("/addMemberToGroup/:id", addMemberToGroup);
router.post("/removeMemberFromGroup/:id", removeMemberFromGroup);
router.post("/createCustomRole/:id", createCustomRole);
router.get("/deleteCustomRole/:id/:roleId", deleteCustomRole);
router.post("/assignRole/:id/:userId", assignRole);
router.get("/requestToJoinGroup/:id", checkAuth, requestToJoinGroup);
router.post("/handleJoinRequest/:id", handleJoinRequest);
router.get("/getJoinRequests/:id", getJoinRequests);
router.get("/getPermissions/:id", checkAuth, getPermissionsForUser);

module.exports = router;
