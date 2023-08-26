const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const UserRouter = require("./api/User");

app.use(express.json());

app.use("/user", UserRouter);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to Mongodb");
    app.listen(8080, () => {
      console.log(`Node  is running on port 8080`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
