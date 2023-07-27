const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TagsList = new mongoose.Schema({
    tag_name: {
        type: String,
        unique:true
    },
    tag_status:{
        type:Boolean,
        default:false
    },
    search_count:{
        type:Number,
        default:0
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
    });

module.exports = SettingsData = mongoose.model('tags', TagsList);
