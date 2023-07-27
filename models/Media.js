const mongoose = require('mongoose');
const MediaHistory = new mongoose.Schema({
    url:{
        type:String,
        default:""
    },
    deleted: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date
    }
});

module.exports = MediaData = mongoose.model('medias', MediaHistory);
                                 