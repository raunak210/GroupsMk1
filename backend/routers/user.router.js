const express = require("express");
const { login, signup, getUser } = require("../controllers/user.controller");
const { checkAuth } = require("../middleware/user.middleware");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/getUser", checkAuth, getUser);

module.exports = router;
