const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rating_schema = new mongoose.Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users_record'
      },
    rating_given_to: {
        type: Schema.Types.ObjectId,
        ref: 'users_record'
    },
    question_one_answer: {
        type: Number
    },
    question_two_answer: {
        type: [Number]
    },
    question_three_answer: {
        type: Number
    },
    question_four_answer: {
        type: Number
    },
    question_five_answer: {
        type: Number
    },
    question_six_answer: {
        type: Number
    },
    question_seven_answer: {
        type: Number
    },
    question_eight_answer: {
        type: String,
        default:""
    },
    report: {
        type: Number,
        default:0
    },
    review_status: { // 1 if review/report done
        type: Number,
        default:1
    },
    deleted: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date,
    },
});

module.exports = Rating = mongoose.model('ratings', rating_schema);
