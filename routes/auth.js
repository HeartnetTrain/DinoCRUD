const express = require("express");
const router = express.Router();
const authUtils = require("../utils/auth");
const passport = require("passport");
const flash = require("connect-flash");

//Create Login Page

router.get("/login", (req, res, next) => {
  const messages = req.flash();
  res.render("login", { messages });
});

//Handle Login request

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "Wrong dinoname or password"
  }),
  (req, res, next) => {
    res.redirect("/users");
  }
);

//Register Page Creation

router.get("/register", (req, res, next) => {
  const messages = req.flash();
  res.render("register", { messages });
});

//Handle Resgistration Request

router.post("/register", (req, res, next) => {
  const registrationParams = req.body;
  const dinos = req.app.locals.dinos;
  const payload = {
    dinoname: registrationParams.dinoname,
    password: authUtils.hashPassword(registrationParams.password)
  };

  dinos.insertOne(payload, err => {
    if (err) {
      req.flash("error", "Dino account already exists.");
    } else {
      req.flash("success", "Dino account registered successfully.");
    }

    res.redirect("/auth/register");
  });
});

//Logout Page

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
