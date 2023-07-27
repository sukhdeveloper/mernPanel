const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new mongoose.Schema({
    username:{
        type : String,
        required: true
    },
    image : {
        type : String,
        default: null
    },
    age : {
        type : Number,
        default: 0,
    },
    gender: {
        type: String,
    },
    email: {
        type : String,
        required: true
    }, 
    phone:{
        type: Number
    },
    password:{
        type: String,
        required: true
    },
    verified : {
        type : Boolean,
        default: 0
    },
    verification_code : {
        type: Number,
        default : null
    },
    account_status: {
        type: Boolean,
        default :false
    },
    deleted: {
       type: Boolean,
       default : false
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    verification_code_expire:{
        type: Date
    },
    updated_at: {
        type: Date
    },
    otp_token: {
         type: String,
    },
});
module.exports = UserData = mongoose.model("user", User);
