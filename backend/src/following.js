const Profile = require("./models/Profile");
const isLoggedIn = require("./middleware/isLoggedIn");

const findProfile = async (username) => {
  const profile = await Profile.findOne({ username });
  if (profile) {
    return profile;
  }
  throw new Error("profile not found");
};

const getFollowing = async (req, res) => {
  const targetUser = req.params.user || req.username;
  try {
    const profile = await findProfile(targetUser);
    return res.send({ username: targetUser, following: profile.following });
  } catch (err) {
    return res.status(404).send({ error: err.message });
  }
};

const addFollowing = async (req, res) => {
  const userToAdd = req.params.user || (req.body && req.body.user);
  if (!userToAdd) {
    return res.status(400).send({ error: "user is required" });
  }
  if (userToAdd === req.username) {
    return res.status(400).send({ error: "cannot follow yourself" });
  }

  await findProfile(userToAdd);

  const profile = await Profile.findOneAndUpdate(
    { username: req.username },
    { $addToSet: { following: userToAdd } },
    { new: true }
  );
  return res.send({ username: req.username, following: profile.following });
};

const removeFollowing = async (req, res) => {
  const userToRemove = req.params.user;
  if (!userToRemove) {
    return res.status(400).send({ error: "user param required" });
  }

  const profile = await Profile.findOneAndUpdate(
    { username: req.username },
    { $pull: { following: userToRemove } },
    { new: true }
  );
  return res.send({ username: req.username, following: profile.following });
};

module.exports = (app) => {
  app.get("/following/:user?", isLoggedIn, getFollowing);
  app.put("/following/:user", isLoggedIn, addFollowing);
  app.delete("/following/:user", isLoggedIn, removeFollowing);
};
