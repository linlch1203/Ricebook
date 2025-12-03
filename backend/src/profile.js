const Profile = require("./models/Profile");
const isLoggedIn = require("./middleware/isLoggedIn");
const uploadImage = require("./uploadCloudinary");
const { upload } = require("./uploadCloudinary");

const findProfile = async (username) => {
  const profile = await Profile.findOne({ username });
  if (profile) {
    return profile;
  }
  throw new Error("profile not found");
};

const safeSend = (res, payload) => res.send(payload);

const handleProfileField =
  ({ field, mutable = true }) =>
  async (req, res) => {
    const targetUser = req.params.user || req.username;

    if (req.method === "GET" || !mutable) {
      try {
        const profile = await findProfile(targetUser);
        return safeSend(res, { username: targetUser, [field]: profile[field] });
      } catch (err) {
        return res.status(404).send({ error: err.message });
      }
    }

    const value = req.body && req.body[field];
    if (!value) {
      return res.status(400).send({ error: `${field} is required` });
    }

    const profile = await Profile.findOneAndUpdate(
      { username: req.username },
      { [field]: value },
      { new: true }
    );

    return safeSend(res, { username: req.username, [field]: profile[field] });
  };

const getDob = async (req, res) => {
  try {
    const profile = await findProfile(req.username);
    return res.send({ username: req.username, dob: profile.dob });
  } catch (err) {
    return res.status(404).send({ error: err.message });
  }
};

const uploadAvatar = async (req, res) => {
  const avatarUrl = req.file ? req.file.url : req.body.avatar;
  if (!avatarUrl) {
    return res.status(400).send({ error: "avatar is required" });
  }

  const profile = await Profile.findOneAndUpdate(
    { username: req.username },
    { avatar: avatarUrl },
    { new: true }
  );

  return safeSend(res, { username: req.username, avatar: profile.avatar });
};

module.exports = (app) => {
  app.get(
    "/headline/:user?",
    isLoggedIn,
    handleProfileField({ field: "headline", mutable: false })
  );
  app.put("/headline", isLoggedIn, handleProfileField({ field: "headline" }));

  app.get(
    "/display/:user?",
    isLoggedIn,
    handleProfileField({ field: "display", mutable: false })
  );
  app.put("/display", isLoggedIn, handleProfileField({ field: "display" }));

  app.get(
    "/email/:user?",
    isLoggedIn,
    handleProfileField({ field: "email", mutable: false })
  );
  app.put("/email", isLoggedIn, handleProfileField({ field: "email" }));

  app.get(
    "/zipcode/:user?",
    isLoggedIn,
    handleProfileField({ field: "zipcode", mutable: false })
  );
  app.put("/zipcode", isLoggedIn, handleProfileField({ field: "zipcode" }));

  app.get(
    "/phone/:user?",
    isLoggedIn,
    handleProfileField({ field: "phone", mutable: false })
  );
  app.put("/phone", isLoggedIn, handleProfileField({ field: "phone" }));

  app.get(
    "/avatar/:user?",
    isLoggedIn,
    handleProfileField({ field: "avatar", mutable: false })
  );
  app.put(
    "/avatar",
    isLoggedIn,
    upload.single("avatar"),
    uploadImage(null),
    uploadAvatar
  );

  app.get("/dob", isLoggedIn, getDob);
};
