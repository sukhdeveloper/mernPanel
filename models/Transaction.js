const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Transaction_schema = new mongoose.Schema({

    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
    subscription_id: {
        type: Schema.Types.ObjectId,
        ref: 'subscriptions'
    },
    transaction_id: {
        type: String,
        required: true,
    },
    paymentmethod_id: {
        type: String,
    },
    value: {
        type: Number,
        required: true,
    },
    invoice_id: {
        type: String,
        required: true,
    },
    invoice_link: {
        type: String,
        required: true,
    },
    billing_date: {
        type: Date,
        required: true,
    },
    subscription_title: {
        type: String,
        required: true,
    },
    card_method: {
        type: String,
        required: true,
    },
    perValue: {
        type: String,
    },
    plan_start_date: {
        type: Date,
    },
    plan_end_date: {
        type: Date,
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

module.exports = Transaction = mongoose.model('transactions', Transaction_schema);
