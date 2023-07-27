const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new mongoose.Schema({
    trend_id : {
        type: Schema.Types.ObjectId,
        ref: "trends", 
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    superadmin_id_or_mern2_warrior_id : {
        type: Schema.Types.ObjectId,
        ref: "admins",
    },
    history:[
        {
            lastcomment:{
                type: String,
            },
            created_at: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    comment:{
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
module.exports = CommentData = mongoose.model("comment", Comment);
