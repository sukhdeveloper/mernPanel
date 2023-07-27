const mongoose = require('mongoose');

const Categories = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default:""
  },
  slug: {
    type: String,
    required: true
  },
  banners: {
    type: [String]
  },
  pin_to_sidebar: {
    type: Boolean,
    default:false
  },
  publication_status: {
    type: Boolean,
    default:false
  },
  deleted:{
    type: Boolean,
    default:false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }

});

module.exports = CategoriesData = mongoose.model('categories', Categories);
