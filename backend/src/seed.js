const md5 = require("md5");
const User = require("./models/User");
const Profile = require("./models/Profile");
const Article = require("./models/Article");
const { buildProfileDefaults } = require("./profileDefaults");

const ensureTestUser = async () => {
  const username = "testuser1";
  const password = "12345678";

  // 1. Ensure User exists
  let user = await User.findOne({ username });
  if (!user) {
    const salt = md5(`${username}-${Date.now()}`);
    const hash = md5(salt + password);
    user = await User.create({ username, salt, hash });
    await Profile.create(buildProfileDefaults(username));
    console.log(`Created test user: ${username}`);
  }

  // 2. Ensure User has some articles
  const articleCount = await Article.countDocuments({ author: username });
  if (articleCount === 0) {
    const lastArticle = await Article.findOne().sort({ pid: -1 }).lean();
    let nextPid = lastArticle ? lastArticle.pid + 1 : 1;

    const articles = [
      {
        pid: nextPid++,
        author: username,
        text: "Hello world! This is my first post on RiceBook.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        comments: [],
      },
      {
        pid: nextPid++,
        author: username,
        text: "Testing out the new features. Everything seems to be working great!",
        date: new Date(),
        comments: [],
      },
      {
        pid: nextPid++,
        author: username,
        text: "Can't wait to see what everyone else is posting.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        comments: [],
      },
    ];

    await Article.insertMany(articles);
    console.log(`Created ${articles.length} seed articles for ${username}`);
  }
};

module.exports = { ensureTestUser };
