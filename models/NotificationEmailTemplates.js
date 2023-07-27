const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationTemplates = new mongoose.Schema({
  notification_title: {
    type: String,
  },
  notification_type: {
    type: Number, // 1 => for admin notification , 2 => for mern2_warriors notification and, 3 => for users notification and
  },
  sendgrid_template_ids: {
    type: [String],
  },
  deleted: {
    type: Number,
    default: 0,
  },
  notification_status: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  deleted_at: {
    type: Date,
  },
});

module.exports = Templates = mongoose.model(
  "notification_email_templates",
  notificationTemplates
);
