const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AdminScheme = new mongoose.Schema({
  user_name:{
    type: String,
    required:true
  },
  profile_image:{
    type: String,
  },
  first_name: {
    type: String,
  },
  last_name:{
    type:String,
  },
  profile_description:{
      type: String,
  },
  phone: {
    type: Number
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  verified : {
    type : Boolean,
    default: 0           //default 0 for account pending 1 for active 
  },
  account_status: {
    type: Boolean,
    default :true
  },
  verification_link_expire: {
    type: Boolean,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  otp: {
    type: Number,
  },
  otp_expired: {
    type: Date,
  },
  otp_token: {
    type: String,
  },
  profile: {
    author_name: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    dribble: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    medium: {
      type: String,
      default: "",
    },
  },
  user_role: {
    type: Number,
    default : 0     // 0 for the admin , 1 for mern2 Warrior 
  },
  categories_id: {
    type: [Schema.Types.ObjectId],
    ref: "categories",
  },
  subcategories_id: {
    type: [Schema.Types.ObjectId],
    ref: "subcategories",
  },
  deleted: {
    type: Boolean,
    default : false
  }
});

module.exports = User = mongoose.model("admins", AdminScheme);
