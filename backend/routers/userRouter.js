import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import data from "../data.js";
import User from "../models/userModel.js";
import {
  generateToken,
  mailTransporter,
  transporter,
  orderEmailTemplate,
  isAdmin,
  isAuth,
} from "../utils.js";

const userRouter = express.Router();

// userRouter.get(
//   '/top-sellers',
//   expressAsyncHandler(async (req, res) => {
//     const topSellers = await User.find({ isSeller: true })
//       .sort({ 'seller.rating': -1 })
//       .limit(3);
//     res.send(topSellers);
//   })
// );

userRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        console.log("data");
        let mailDetails = {
          from: {
            name: "NO REPLY",
            address: "noreply@gmail.com",
          },
          to: user.email,
          subject: "SIGN IN SUCCES",
          html: `<h1>Thanks for joing us</h1>
          <h2>Hi ${user.name}</h2>
          <h2>Your Account Details is.</h2>
          <hr/>
          <h3>ID:  ${user._id}</h3>
          <h3>NAME:  ${user.name}</h3>
          <h3>EMAIL:  ${user.email}</h3>
          <h3>PHONE:  ${user.phone}</h3>
          <br/>
          <br/>
          <p>
          Thanks for shopping with us.
          </p>
          <div style="position: center; background: blue; color: white; width: 100px; height:25px; border-radius: 20px; text-align: center;">
          </div>
          `,
        };
        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const createdUser = await user.save();
    res.send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),
    });
    let mailDetails = {
      from: {
        name: "NO REPLY",
        address: "noreply@gmail.com",
      },
      to: createdUser.email,
      subject: "SIGN IN SUCCES",
      html: orderEmailTemplate(createdUser),
    };
    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  })
);

userRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);
userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email.toLowerCase() || user.email.toLowerCase();
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    }
  })
);

userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === "admin@example.com") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      const deleteUser = await user.remove();
      res.send({ message: "User Deleted", user: deleteUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email.toLowerCase() || user.email.toLowerCase();
      user.phone = req.body.phone || user.phone;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

export default userRouter;
