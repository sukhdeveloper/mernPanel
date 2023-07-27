const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReplySchema = new mongoose.Schema({
    trend_id : {
        type: Schema.Types.ObjectId,
        ref: "trends", 
    },
    comment_id : {
        type : Schema.Types.ObjectId,
        ref:"comment"
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    history:[
        {
            lastreply:{
                type: String,
            },
            created_at: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    reply_to:{
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    reply:{
        type: String,
        required: true
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
module.exports = Reply = mongoose.model("replies", ReplySchema);
