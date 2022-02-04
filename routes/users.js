const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/catchAsync");
const passport = require("passport");
const users = require("../controllers/users");

router.get("/user/:id", catchAsync(users.profilePage));

router.route("/register").get(users.registerForm).post(catchAsync(users.registerNewUser));

router
  .route("/login")
  .get(users.loginForm)
  .post(
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
    users.loginNewUser
  );

router.get("/logout", users.logout);

module.exports = router;
