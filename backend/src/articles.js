const Article = require("./models/Article");
const Profile = require("./models/Profile");
const isLoggedIn = require("./middleware/isLoggedIn");
const uploadImage = require("./uploadCloudinary");
const { upload } = require("./uploadCloudinary");

const fetchAuthors = async (username) => {
  const profile = await Profile.findOne({ username });
  const following = profile ? profile.following : [];
  return [username, ...following];
};

const getAccessibleArticles = async (username, page = 1, limit = 10) => {
  const authors = await fetchAuthors(username);
  const skip = (page - 1) * limit;
  return Article.find({ author: { $in: authors } })
    .sort({ date: -1, pid: -1 })
    .skip(skip)
    .limit(limit);
};

const getArticles = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const articles = await getAccessibleArticles(req.username, page, limit);
  return res.send({ articles });
};

const getArticleById = async (req, res) => {
  const param = req.params.id;
  const articleId = Number(param);

  if (!Number.isNaN(articleId)) {
    const article = await Article.find({ pid: articleId });
    if (!article.length) {
      return res.status(404).send({ articles: [] });
    }
    return res.send({ articles: article });
  }

  // If not a number, treat as username
  const articles = await Article.find({ author: param }).sort({ date: -1 });
  return res.send({ articles });
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
  const articleData = { pid, author: req.username, text };
  if (req.file && req.file.url) {
    articleData.image = req.file.url;
  }

  await Article.create(articleData);
  const articles = await getAccessibleArticles(req.username);
  return res.status(201).send({ articles });
};

const updateArticle = async (req, res) => {
  const articleId = Number(req.params.id);
  if (Number.isNaN(articleId)) {
    return res.status(400).send({ error: "invalid article id" });
  }
  const { text, commentId } = req.body || {};

  // If commentId is provided, we are updating a comment
  if (commentId !== undefined) {
    if (commentId === -1) {
      // Add new comment
      if (!text) {
        return res.status(400).send({ error: "text is required" });
      }
      const article = await Article.findOne({ pid: articleId });
      if (!article) {
        return res.status(404).send({ error: "article not found" });
      }
      const newCommentId =
        article.comments.length > 0
          ? Math.max(...article.comments.map((c) => c.commentId)) + 1
          : 1;

      const updatedArticle = await Article.findOneAndUpdate(
        { pid: articleId },
        {
          $push: {
            comments: { commentId: newCommentId, author: req.username, text },
          },
        },
        { new: true }
      );
      return res.send({ articles: [updatedArticle] });
    } else {
      // Update existing comment (only if owned by user)
      // Note: The requirement "Users can edit articles and comments" usually implies editing their own.
      // However, for comments, sometimes the author of the article can edit?
      // Let's assume the author of the comment can edit it.

      // Find the article first to check ownership
      const article = await Article.findOne({ pid: articleId });
      if (!article) {
        return res.status(404).send({ error: "article not found" });
      }

      const comment = article.comments.find((c) => c.commentId === commentId);
      if (!comment) {
        return res.status(404).send({ error: "comment not found" });
      }

      if (comment.author !== req.username) {
        return res.status(403).send({ error: "forbidden" });
      }

      const updatedArticle = await Article.findOneAndUpdate(
        { pid: articleId, "comments.commentId": commentId },
        { $set: { "comments.$.text": text } },
        { new: true }
      );
      return res.send({ articles: [updatedArticle] });
    }
  }

  // Otherwise, update article text (only if owned by user)
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
  app.post(
    "/article",
    isLoggedIn,
    upload.single("image"),
    uploadImage(null),
    addArticle
  );
  app.put("/articles/:id", isLoggedIn, updateArticle);
};
