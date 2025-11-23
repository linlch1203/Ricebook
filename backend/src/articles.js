const Article = require("./models/Article");
const Profile = require("./models/Profile");
const isLoggedIn = require("./middleware/isLoggedIn");

const fetchAuthors = async (username) => {
  const profile = await Profile.findOne({ username });
  const following = profile ? profile.following : [];
  return [username, ...following];
};

const getAccessibleArticles = async (username) => {
  const authors = await fetchAuthors(username);
  return Article.find({ author: { $in: authors } }).sort({ date: -1, pid: -1 });
};

const getArticles = async (req, res) => {
  const articles = await getAccessibleArticles(req.username);
  return res.send({ articles });
};

const getArticleById = async (req, res) => {
  const articleId = Number(req.params.id);
  if (Number.isNaN(articleId)) {
    return res.status(400).send({ error: "invalid article id", articles: [] });
  }

  const article = await Article.find({ pid: articleId });
  if (!article.length) {
    return res.status(404).send({ articles: [] });
  }
  return res.send({ articles: article });
};

const nextArticleId = async () => {
  const lastArticle = await Article.findOne().sort({ pid: -1 }).lean();
  return lastArticle ? lastArticle.pid + 1 : 1;
};

const addArticle = async (req, res) => {
  const { text } = req.body || {};
  if (!text) {
    return res.status(400).send({ error: "text is required" });
  }

  const pid = await nextArticleId();
  await Article.create({ pid, author: req.username, text });
  const articles = await getAccessibleArticles(req.username);
  return res.status(201).send({ articles });
};

const updateArticle = async (req, res) => {
  const articleId = Number(req.params.id);
  if (Number.isNaN(articleId)) {
    return res.status(400).send({ error: "invalid article id" });
  }
  const { text } = req.body || {};
  if (!text) {
    return res.status(400).send({ error: "text is required" });
  }

  const article = await Article.findOneAndUpdate(
    { pid: articleId, author: req.username },
    { text },
    { new: true }
  );

  if (!article) {
    return res.status(404).send({ error: "article not found" });
  }

  return res.send({ articles: [article] });
};

module.exports = (app) => {
  app.get("/articles", isLoggedIn, getArticles);
  app.get("/articles/:id", isLoggedIn, getArticleById);
  app.post("/article", isLoggedIn, addArticle);
  app.put("/articles/:id", isLoggedIn, updateArticle);
};
