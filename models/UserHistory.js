const mongoose = require('mongoose');
const HistorySchema = new mongoose.Schema({
    user_ip:{
        type:String,
    },
    page_visited_url:{
        type:String,
        default:""
    },
    time_spent:{
        type:String,
        default:"",
    },
    deleted: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});

module.exports = HistoryData = mongoose.model('history', HistorySchema);
                                 