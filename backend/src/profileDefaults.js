const buildProfileDefaults = (username) => ({
  username,
  display: username,
  headline: "This is my headline!",
  email: `${username}@email.com`,
  zipcode: "77005",
  phone: "123-456-7890",
  dob: new Date("1990-01-01"),
  avatar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/200px-Default_pfp.jpg",
});

module.exports = { buildProfileDefaults };
