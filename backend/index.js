const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routers/user.router");
const groupRouter = require("./routers/group.router");

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

console.log("index.js");

//routers

app.use("/api/user", userRouter);
app.use("/api/groups", groupRouter);

app.listen(PORT, () => {
  mongoose.connect(process.env.MONGO_URI).then((res) => {
    console.log(
      `mongo db connected on ${process.env.MONGO_URI} app is listening on port ${PORT}  `
    );
  });
});
