const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Subcategories = new mongoose.Schema({
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "categories",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  slug: {
    type: String,
    required: true,
  },
  banners: {
    type: [String],
  },
  publication_status: {
    type: Boolean,
  },
  deleted: {
    type: Boolean,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = SubcategoriesData = mongoose.model(
  "subcategories",
  Subcategories
);
