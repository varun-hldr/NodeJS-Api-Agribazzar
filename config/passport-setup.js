const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook");
const GoogleStrategy = require("passport-google-oauth20");

const Users = require("../models/user-model");
const keys = require("../config/keys");

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(async (id, done) => {
  await Users.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((e) => {
      done(new Error("Failed to deserialize an user"));
    });
});

/* PASSPORT LOCAL AUTHENTICATION */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      // Setting up user in the session
      const user = await Users.findOne({ email: req.body.email });
      done(null, user);
    }
  )
);

// Passport Google Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      // check if user already exist in our db
      const oldUser = await Users.findOne({ googleId: profile.id });
      if (oldUser) return done(null, oldUser);

      const newUser = await new Users({
        username: profile.displayName,
        email: profile._json.email,
        googleId: profile.id,
        role: "Admin",
        status: "Active",
      }).save();

      return done(null, newUser);
    }
  )
);

// Passport Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebook.clientID,
      clientSecret: keys.facebook.clientSecret,
      callbackURL: "/auth/facebook/redirect",
      profileFields: ["id", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      // check if user already exist in our db
      const oldUser = await Users.findOne({ facebookId: profile.id });
      if (oldUser) return done(null, oldUser);

      const newUser = await new Users({
        username: profile._json.name,
        email: profile._json.email,
        facebookId: profile.id,
        role: "Admin",
        status: "Active",
      }).save();

      return done(null, newUser);
    }
  )
);
