const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classDetailsSchema = new mongoose.Schema({
  notification_title: {
    type: String
  },
  notification_type: {
    type: Number // 1 => on demand class is booked , 2 => payout released , 3 => session started, 4 => session ended
  },
  read_status: {
    type: Number, // 0 => unread , 1 => read
    default: 0
  },
  deleted: {
    type:Number,
    default: 0
  },
  user_id:{
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  notification_for:{
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  session_id:{
    type: Schema.Types.ObjectId,
    ref: 'class_details'
  },
  amount:{
    type:Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }

});

module.exports = Class = mongoose.model('app_notifications', classDetailsSchema);
