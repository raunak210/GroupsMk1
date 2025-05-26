const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: "CustomRole" }],
    joinRequests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);
const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
