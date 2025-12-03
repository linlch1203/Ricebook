const buildProfileDefaults = (username, overrides = {}) => ({
  username,
  display: overrides.display || username,
  headline: overrides.headline || "This is my headline!",
  email: overrides.email || `${username}@email.com`,
  zipcode: overrides.zipcode || "77005",
  phone: overrides.phone || "123-456-7890",
  dob: overrides.dob ? new Date(overrides.dob) : new Date("1990-01-01"),
  avatar:
    overrides.avatar ||
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/200px-Default_pfp.jpg",
});

module.exports = { buildProfileDefaults };
