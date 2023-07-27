const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ReportSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'admins'
      },
    title : {
        type: String,
        default:""
    },
    docLink:{
        type: String,
        default:""
    },
    deleted: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default : Date.now()
    },
    updated_at: {
        type: Date,
    },
});

module.exports = Reports = mongoose.model('reports', ReportSchema);
