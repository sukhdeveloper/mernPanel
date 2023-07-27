const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Trends = new mongoose.Schema({
  category_ids: {
    type: [Schema.Types.ObjectId],
    ref: "categories",
  },
  subcategory_ids: {
    type: [Schema.Types.ObjectId],
    ref: "subcategories",
  },
  tags_ids: {
    type: [Schema.Types.ObjectId],
    ref: "tags",
  },
  focus_tags_ids: {
    type: [Schema.Types.ObjectId],
    ref: "tags",
  },
  title: {
    type: String,
    required: true,
  },
  sub_heading: {
    type: String,
  },
  summary: {
    type: String,
  },
  review_summary: {
    type: String,
  },
  reference_links: {
    type: [String],
  },
  slug: {
    type: String,
    required: true,
  },
  preview_image:{
    type: String,
  },
  featured_images: {
    type: [String],
  },
  video_link: {
    type: [String],
  },
  read_time: {
    type: Number,
  },
  seo: {
    h1_tag: {
      type: String,
    },
    meta_content: {
      type: String,
    },
    head_scripts: [
      { script_type: { type: String }, script_content: { type: String } },
    ],
    body_scripts: [
      { script_type: { type: String }, script_content: { type: String } },
    ],
  },
  popularity: {
    type: Number,
  },
  inventiveness: {
    type: Number,
  },
  engagement: {
    type: Number,
  },
  human_centricity: {
    type: Number,
  },
  score: {
    type: Number,
  },
  gender: {
    type: [Number],
  },
  age_group: {
    type: [Number],
  },
  geography: {
    type: [Number],
  },
  mern2_compass: {
    type: [Number],
  },
  format: {
    type: Number,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "admins",
  },
  author_type: {
    type: Number,
    default:1
  },
  publication_status: {
    type: Boolean,
    default:false
  },
  featured:{
    type: Boolean,
    default:false
  },
  views_count_start_from:{
    type:Number,
    default:0
  },
  related_trend_ids:{
    type: [Schema.Types.ObjectId],
    ref: "trends",
    default: []
  },
  comment_status: {
    type: Boolean,
    default:true
  },
  deleted: {
    type: Boolean, // false -- active , true - deactive
    default : false
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = TrendsData = mongoose.model("trends", Trends);
