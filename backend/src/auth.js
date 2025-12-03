const md5 = require("md5");
const passport = require("passport");
const User = require("./models/User");
const Profile = require("./models/Profile");
const isLoggedIn = require("./middleware/isLoggedIn");
const { createSession, removeSession, cookieKey } = require("./session");
const { buildProfileDefaults } = require("./profileDefaults");

const register = async (req, res) => {
  const { username, password, email, phone, zipcode, dob, display } =
    req.body || {};

  if (!username || !password) {
    return res.status(400).send({ error: "username and password required" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).send({ error: "username already exists" });
  }

  const salt = md5(`${username}-${Date.now()}`);
  const hash = md5(salt + password);

  await User.create({ username, salt, hash });
  await Profile.create(
    buildProfileDefaults(username, { email, phone, zipcode, dob, display })
  );

  return res.send({ username, result: "success" });
};

const login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).send({ error: "username and password required" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).send({ error: "invalid credentials" });
  }

  const hash = md5(user.salt + password);
  if (hash !== user.hash) {
    return res.status(401).send({ error: "invalid credentials" });
  }

  const sid = createSession(username);
  const cookieOptions = {
    maxAge: 3600 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };
  res.cookie(cookieKey, sid, cookieOptions);

  return res.send({ username, result: "success" });
};

const updatePassword = async (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).send({ error: "password is required" });
  }

  const salt = md5(`${req.username}-${Date.now()}`);
  const hash = md5(salt + password);

  await User.findOneAndUpdate({ username: req.username }, { salt, hash });

  return res.send({ username: req.username, result: "password updated" });
};

const logout = async (req, res) => {
  removeSession(req.sid);
  res.clearCookie(cookieKey);
  return res.send({ result: "logout success" });
};

module.exports = (app) => {
  app.post("/register", register);
  app.post("/login", login);
  app.put("/password", isLoggedIn, updatePassword);
  app.put("/logout", isLoggedIn, logout);

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      prompt: "select_account",
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      session: false,
    }),
    async (req, res) => {
      const username = req.user.username;

      // Check if we are linking accounts (user already logged in)
      // Note: Passport session strategy might handle this, but since we use custom sessions...
      // Actually, if the user is already logged in, we might want to link.
      // But the /auth/google route initiates a new flow.
      // For this assignment, "linking" usually means if the email matches, or if we explicitly link.
      // The current implementation in passport.js likely finds or creates a user based on Google ID.

      const sid = createSession(username);
      const cookieOptions = {
        maxAge: 3600 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      };
      res.cookie(cookieKey, sid, cookieOptions);
      res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
    }
  );

  app.post("/auth/unlink", isLoggedIn, async (req, res) => {
    // Remove Google ID from user
    await User.findOneAndUpdate(
      { username: req.username },
      { $unset: { "auth.google": "" } }
    );
    res.send({ result: "success" });
  });
};
