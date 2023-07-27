const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PortalSettings = new mongoose.Schema({
  user_id: {
    type: [Schema.Types.ObjectId],
    ref: "admins",
  },
  logo: {
    type: String,
  },
  payment_gateways: {
    razorpay: {
      key: {
        type: String,
        default: "",
      },
      secret_key: {
        type: String,
        default: "",
      },
    },
  },
  email_addresses_to_get_notifications: {
    type: [String],
    default: [],
  },
  invoice_details: {
    company_address: {
      type: String,
      default: "",
    },
    gst_number: {
      type: String,
      default: "",
    },
    gst: {
      type: Number,
    },
    igst: {
      type: String,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  deleted_at: {
    type: Date,
  },
});

module.exports = portalSettings = mongoose.model(
  "portal_settings",
  PortalSettings
);
