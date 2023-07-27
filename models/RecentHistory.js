const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const RecentHistorySchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users_record'
    },
    user_ip:{
        type:String,
    },
    trend_id : {
        type: Schema.Types.ObjectId,
        ref: "trends", 
    },
    deleted: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    }
});

module.exports = Recent = mongoose.model('recent_history', RecentHistorySchema);
