const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    commentId: { type: Number, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    pid: { type: Number, unique: true, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Article || mongoose.model("Article", articleSchema);
