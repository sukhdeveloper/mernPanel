const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeTrend = new mongoose.Schema({
    trend_id : {
        type: Schema.Types.ObjectId,
        ref: "trends", 
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    like_dislike:{
        type: Boolean, // 1 for like , 0 for dislike
        default : 1
    },
    deleted: {
       type: Boolean,
       default : false
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date
    },
});
module.exports = LikeTrendData = mongoose.model("liketrend", LikeTrend);
