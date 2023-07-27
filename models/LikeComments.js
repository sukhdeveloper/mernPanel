const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeComments = new mongoose.Schema({
    comment_id : {
        type : Schema.Types.ObjectId,
        ref:"comment"
    },
    reply_id :{
        type : Schema.Types.ObjectId,
        ref:"reply"
    },
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
module.exports = LikeCommentsData = mongoose.model("likecomment", LikeComments);
