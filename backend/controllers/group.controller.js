const Group = require("../models/group.model");
const CustomRole = require("../models/customRole.model");
const User = require("../models/user.model");

exports.getGroupBasicInfo = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId).populate("owner");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.status(200).json({
      name: group.name,
      memberCount: group.members?.length,
      owner: group.owner,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getGroupInfo = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId)
      .populate("owner")
      .populate("members", "-password")
      .populate("customRoles");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.status(200).json({
      name: group.name,
      description: group.description,
      members: group.members,
      owner: group.owner,
      customRoles: group.customRoles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  try {
    const newGroup = await Group.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    const owner = await User.findById(req.user.id);
    if (!owner.groups) owner.groups = [newGroup._id];
    else owner.groups.push(newGroup._id);
    await owner.save();

    return res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addMemberToGroup = async (req, res) => {
  const groupId = req.params.id;
  const { userDetail } = req.body;

  if (!userDetail) {
    return res.status(400).json({ message: "Please provide a user detail" });
  }

  let userId, userEmail;

  if (userDetail.includes("@")) {
    userEmail = userDetail;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    userId = user._id;
  } else {
    userId = userDetail;

    const user = await User.findById(userId);
    if (!user) return res.stats(400).json({ message: "user not found" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(userId);
    await group.save();

    const user = await User.findById(userId);
    if (!user.groups) user.groups = [groupId];
    else user.groups.push(groupId);
    await user.save();

    return res.status(200).json({
      message: "Member added successfully",
      user: { name: user.name, email: user.email, _id: user._id },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeMemberFromGroup = async (req, res) => {
  const groupId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Please provide a user ID" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this group" });
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    const user = await User.findById(userId);

    user.groups = user.groups.filter((group) => group.toString() !== groupId);
    await user.save();

    return res.status(200).json({
      message: "Member removed successfully",
      group,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCustomRole = async (req, res) => {
  const { name, permissions } = req.body;
  const groupId = req.params.id;

  if (!name || !permissions) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const newRole = await CustomRole.create({
      name,

      permissions,
      group: groupId,
      users: [],
    });

    group.customRoles.push(newRole._id);
    await group.save();

    return res.status(201).json({
      message: "Custom role created successfully",
      role: newRole,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCustomRole = async (req, res) => {
  const roleId = req.params.roleId;
  const groupId = req.params.id;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group or role not found" });
    }
    group.customRoles = group.customRoles.filter(
      (role) => role.toString() !== roleId
    );
    await group.save();
    await CustomRole.findByIdAndDelete(roleId);
    return res
      .status(200)
      .json({ message: "Custom role deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.assignRole = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.params.userId;
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: "Please provide a role ID" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const role = await CustomRole.findById(roleId);
    if (!role || !group.customRoles.includes(role._id)) {
      return res.status(404).json({ message: "Role not found in this group" });
    }

    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Member not found in this group" });
    }

    if (role.users.includes(userId)) {
      return res.status(400).json({ message: "User already has this role" });
    }

    const checkRole = await CustomRole.findOne({
      group: groupId,
      users: userId,
    });

    if (checkRole) {
      return res.status(400).json({
        message: "User already has a role in this group",
      });
    }

    role.users.push(userId);
    role.group = groupId;
    await role.save();

    return res.status(200).json({
      message: "Role assigned successfully",
      role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.requestToJoinGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.userId;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member" });
    }
    if (
      group.joinRequests.some((request) => request.user.toString() === userId)
    ) {
      return res.status(400).json({ message: "Join request already exists" });
    }
    group.joinRequests.push({ user: userId, status: "pending" });
    await group.save();

    return res.status(200).json({
      message: "Join request sent successfully",
      group,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.handleJoinRequest = async (req, res) => {
  const groupId = req.params.id;
  const { userId, status } = req.body;

  if (!userId || !status) {
    return res
      .status(400)
      .json({ message: "Please provide user ID and status" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const requestIndex = group.joinRequests.findIndex(
      (request) => request.user.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: "Join request not found" });
    }

    group.joinRequests[requestIndex].status = status;

    if (status === "approved") {
      group.members.push(userId);
    }

    await group.save();

    return res.status(200).json({
      message: `Join request ${status} successfully`,
      group,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getJoinRequests = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await Group.findById(groupId).populate("joinRequests.user");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    return res.status(200).json({
      joinRequests: group.joinRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPermissionsForUser = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const group = await Group.findById(groupId)
      .populate("customRoles")
      .populate("members");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const user = group.members.find(
      (member) => member._id.toString() === userId
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in this group", permissions: [] });
    }

    const userRoles = group.customRoles.filter((role) =>
      role.users.includes(userId)
    );

    const permissionmap = {};

    const permissions = userRoles.reduce((acc, role) => {
      role.permissions.forEach((permission) => {
        if (!permissionmap[permission]) {
          permissionmap[permission] = true;
          acc.push(permission);
        }
      });
      return acc;
    }, []);

    return res.status(200).json({
      permissions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
