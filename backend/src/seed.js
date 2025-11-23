const md5 = require("md5");
const User = require("./models/User");
const Profile = require("./models/Profile");
const { buildProfileDefaults } = require("./profileDefaults");

const ensureTestUser = async () => {
  const username = "joey";
  const password = "pass";
  const existing = await User.findOne({ username });
  if (existing) {
    return;
  }

  const salt = md5(`${username}-${Date.now()}`);
  const hash = md5(salt + password);
  await User.create({ username, salt, hash });
  await Profile.create(buildProfileDefaults(username));
};

module.exports = { ensureTestUser };
