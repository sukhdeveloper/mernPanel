const mongoose = require('mongoose');
const Settings = new mongoose.Schema({
    setting_name: {
        type: String
    },
    setting_title: {
        type: String
    },
    setting_description: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
    });

module.exports = SettingsData = mongoose.model('settings', Settings);
