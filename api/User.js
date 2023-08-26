const express = require("express");
const router = express.Router();
var cors = require("cors");
const User = require("./../models/User");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const JWT_SECRET = " myjwt";
router.use(cors());
//Signup
router.post("/signup", (req, res) => {
  let { name, email, password } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  if (name == "" || email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields",
    });
  } else if (!/^[a-zA-Z]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is  too short",
    });
  } else {
    //Checking if user already exists
    User.find({ email })
      .then((result) => {
        if (result.length) {
          // useer already exits
          res.json({
            status: "FAILED",
            message: "User with the provided email already",
          });
        } else {
          //Try to create nwe user
          //password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
              });
              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUSCESS",
                    message: "Signup successful",
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "FAILED",
                    message: "An error occured while saving password",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occured while hashing password",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occured while checking for existing user!",
        });
      });
  }
});
router.post("/signin", (req, res) => {
  let { email, password } = req.body;

  email = email.trim();
  password = password.trim();
  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  } else {
    //Check if user exit
    User.find({ email })
      .then((data) => {
        if (data.length) {
          //User exits and compare pass
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                var token = jwt.sign({ email: data[0].email }, JWT_SECRET, {
                  expiresIn: 10,
                });
                res.json({
                  status: "ok",
                  message: "login success",
                  token,
                  data: data,
                });
              } else {
                res.json({ status: "error", message: "password wrong" });
              }

              // res.json({
              //   status: "SUCCESS",
              //   message: "Signin successful",
              //   data: data,
              // });
              //payload sent to frontend
              // generate token JWT ส่ง payload หมดอายุใน10นาที ถ้ามีerr จะแสดดงอกมา ถ้าไม่error จะส่งtoken
              // jwt.sign(
              //   payload,
              //   "jwtsecret",
              //   { expiresIn: 10 },
              //   (err, token) => {
              //     if (err) throw err;
              //     res.json({ token, payload }); //ส่งtoken กับpauoadไปให้user
              //   }
              // );
              //   } else {
              //     res.json({
              //       status: "FAILED",
              //       message: "Invalid password enteered!",
              //     });
              //   }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occured while comparing password",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "An error occured while comparing password",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "FAILED",
          message: "An error occured while checking for exiting user",
        });
      });
  }
});

router.post("/userData", (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }

    const useremail = user.email;
    User.findOne({ email: useremail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) {}
});

module.exports = router;
