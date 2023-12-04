const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { UserModel } = require("../models/user.model");
const authMiddleware = require("../middlewares/auth.middleware");

const userRoute = express.Router();

//Registeration
userRoute.post("/signup", async (req, res) => {
  const { image, username, email, password, role } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email: email });
    const checkusername = await UserModel.findOne({ username: username });
    if (checkusername) {
      res.json({ available: false, message: "Username not available" });
    }
    if (existingUser) {
      res.status(200).send({ msg: "Already Registered !!", registered: false });
    } else {
      bcrypt.hash(password, +process.env.saltRounds, async (err, hash) => {
        if (err) {
          res.status(400).send({ error: err });
        }
        const user = new UserModel({
          image:
            "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=626&ext=jpg&ga=GA1.1.1257944628.1683352118",
          username,
          email,
          password: hash,
          role,
        });
        await user.save();
        res.status(200).send({ message: "Registered successfully",registered: true });
      });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//check username availability
userRoute.get("/check-username/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      res.json({ available: false, message: "Username not available" });
    } else {
      res.json({ available: true, message: "Username available" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Login
userRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let checkUser = await UserModel.findOne({ email: email });
    if (!checkUser) {
      res.status(200).send({ message: "User Not Found !!", login: false });
    } else {
      bcrypt.compare(password, checkUser?.password, (error, result) => {
        if (!result) {
          res.status(200).send({ message: "Wrong Password !!" , login: false});
        } else {
          const accessToken = jwt.sign(
            {
              userID: checkUser?._id,
              username: checkUser?.username,
              role: checkUser?.role,
            },
            process.env.JWT_SECRET
          );
          res.status(200).send({
            msg: "Logged-in successfully",
            login: true,
            accessToken: accessToken,
            user: {
              _id: checkUser?._id,
              username: checkUser?.username,
              email: checkUser?.email,
              role: checkUser?.role,
            },
          });
        }
      });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get a user details
userRoute.get("/:id", authMiddleware, async (req, res)=>{
  const userID = req.params.id;
  try {
    const user = await UserModel.findOne({ _id: userID });
    if (!user) {
      res.status(200).send({ msg: "User not found!" });
    }else{
      res.json(user)
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
})

//Update a User
userRoute.patch("/update/:id", authMiddleware, async (req, res) => {
  const { image, username, email, password, role } = req.body;

  const { id } = req.params;
  try {
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      res.status(200).send({ msg: "User not found!" ,updated: false});
    } else {
      bcrypt.hash(password, +process.env.saltRounds, async (err, hash) => {
        if (err) {
          res.status(400).send({ error: err });
        }
        const user = await UserModel.findByIdAndUpdate(
          { _id: id },
          { image, username, role, password: hash, email }
        );
        const updatedUser = await UserModel.findOne({ _id: id });
        res.status(200).send({
          updated: true,
          message: "Updated successfully",
          user: {
            _id: updatedUser?._id,
            username: updatedUser?.username,
            role: updatedUser?.role,
            email: updatedUser?.email,
          },
        });
      });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Delete a user by admin
userRoute.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (role === "reader" || role === "author") {
    return res.status(403).json({ message: "Access forbidden" });
  }
  try {
    await UserModel.findByIdAndDelete({ _id: id });
    res.status(200).send({ msg: `User with _id: ${id} deleted successfully` });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get all users by admin
userRoute.get("/", authMiddleware, async (req, res) => {
  const { role } = req.body;
  if (role === "reader" || role === "author") {
    return res.status(403).json({ message: "Access forbidden" });
  }
  try {
    const users = await UserModel.find();
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = {
  userRoute,
};
