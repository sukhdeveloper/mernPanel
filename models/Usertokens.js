const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtpTokenScheme = new mongoose.Schema({

  
    user_id:{
        type: Schema.Types.ObjectId,
    ref: "admins",
    },

    otp_token:{
        type:String
      },

    expiredat:{
        type:Date
    },


});

module.exports = OtpToken = mongoose.model('otptoken', OtpTokenScheme);