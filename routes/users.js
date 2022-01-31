const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");
const users = require("../controllers/users");

router.get("/register", users.registerForm);

router.post("/register", catchAsync(users.registerNewUser));

router.get("/login", users.loginForm);

router.post(
  "/login",
  passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
  users.loginNewUser
);

router.get("/logout", users.logout);

module.exports = router;
