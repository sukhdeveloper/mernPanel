const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FrontendOtpTokenScheme = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  otp_token: {
    type: String,
  },
  expiredat: {
    type: Date,
  },
});

module.exports = FrontendOtpToken = mongoose.model(
  "frontendotptoken",
  FrontendOtpTokenScheme
);
