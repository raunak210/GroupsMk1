const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Group = require("../models/group.model");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already  exists with this email" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    return res
      .status(201)
      .json({ message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId)
      .populate("groups")
      .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
