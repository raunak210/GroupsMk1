const mongoose = require("mongoose");

const customRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    permissions: {
      type: [String],
      enum: [
        "MANAGE_MEMBERS",
        "VIEW_GROUP_INFO",
        "MANAGE_ROLES",
        "APPROVE_REQUESTS",
      ],
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CustomRole = mongoose.model("CustomRole", customRoleSchema);
module.exports = CustomRole;
