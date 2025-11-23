const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    display: { type: String, default: "" },
    headline: { type: String, default: "" },
    email: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    phone: { type: String, default: "" },
    dob: { type: Date },
    avatar: { type: String, default: "" },
    following: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
