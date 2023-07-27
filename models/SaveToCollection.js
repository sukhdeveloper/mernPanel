const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaveToCollection = new mongoose.Schema({
    trend_id : {
        type: Schema.Types.ObjectId,
        ref: "trends", 
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: "user",
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
module.exports = SaveToCollectionData = mongoose.model("saveToCollection", SaveToCollection);
