const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

// const CLIENT_HOME_PAGE_URL = "http://localhost:3000";

// Validate User Functions
const { loginValidation, registerValidation } = require("../validation");

// Auth Register
router.post("/register", registerValidation, async (req, res) => {
  res.json({ user: req.user });
});

// when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  if (req.user) {
    //   Create and assign a token
    const token = jwt.sign({ user: req.user }, keys.token.TOKEN_SECRET);
    const user = {
      token: token,
      user: req.user,
      success: true,
    };
    res.send(user);
  }
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logOut();
  res.json({
    success: true,
  });
});

// Auth Login with Passport Local
router.post(
  "/login",
  loginValidation,
  passport.authenticate("local"),
  (req, res) => {
    const user = {
      token: req.token,
      user: req.user,
    };
    res.send(user);
  }
);

// AUTH WITH GOOGLE
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// callback route for google to redirect to
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect(keys.CLIENT_HOME_PAGE_URL);
});

// AUTH WITH FACEBOOK
router.get("/facebook", passport.authenticate("facebook"));

// callback route for facebook to redirect to
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    successRedirect: keys.CLIENT_HOME_PAGE_URL,
    failureRedirect: "/auth/login/failed",
  })
);

module.exports = router;
