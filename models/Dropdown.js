const mongoose = require('mongoose');
const DropdownList = new mongoose.Schema({
    name: {
        type: String
    },
    options: {
        type: [String]
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
    });

module.exports = SettingsData = mongoose.model('dropdowns', DropdownList);
