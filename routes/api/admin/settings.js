const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");
const sendGridAPiKey = process.env.SENDGRID_KEY;
const sgMail = require("@sendgrid/mail");
const Admin = require("../../../models/Admin");
const Categories = require("../../../models/Categories");
const Subcategories = require("../../../models/Subcategories");
const Dropdown = require("../../../models/Dropdown");
const Tags = require("../../../models/Tags");
const Trends = require("../../../models/Trends");
const PortalSettings = require("../../../models/PortalSettings");

var ObjectId = require("mongodb").ObjectID;
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get("/portal_settings", auth, async (req, res) => {
  try {
    var data = await PortalSettings.findOne({ _id: req.user.id });
    res.json({
      success: true,
      response: "successful",
      msg: "Record fetched successfully.",
      data: data,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      errors: [
        {
          response: "error",
          msg: "Server Error",
        },
      ],
    });
  }
});

router.post(
  "/portal_settings/logo",
  auth,
  //   [
  //     check("email", "Registered email is required").isEmail(),
  //     check("password", "Password is required").exists(),
  //   ],
  async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { logo } = req.body;

    try {
      await PortalSettings.findOneAndUpdate(
        { user_id: req.user.id },
        { $set: { logo: logo } },
        { new: true, upsert: true }
      );
      res.json({
        success: true,
        response: "successful",
        msg: "Logo updated successfully.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        errors: [
          {
            response: "error",
            msg: "Server Error",
          },
        ],
      });
    }
  }
);

router.post(
  "/portal_settings/payment_gateway",
  auth,
  [
    check("key", "Key is required").not().isEmpty(),
    check("secret_key", "Secret key is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key, secret_key } = req.body;

    try {
      var dataObject = {
        razorpay: {
          key: key,
          secret_key: secret_key,
        },
      };

      await PortalSettings.findOneAndUpdate(
        { user_id: req.user.id },
        { $set: dataObject },
        { new: true, upsert: true }
      );
      res.json({
        success: true,
        response: "successful",
        msg: "Record updated successfully.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        errors: [
          {
            response: "error",
            msg: "Server Error",
          },
        ],
      });
    }
  }
);

router.post(
  "/portal_settings/email_addresses_to_get_notifications",
  auth,
  [
    check("email_addresses_to_get_notifications", "Email is required")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email_addresses_to_get_notifications } = req.body;

    try {
      var dataObject = {};
      if (email_addresses_to_get_notifications.length > 0) {
        dataObject.email_addresses_to_get_notifications =
          email_addresses_to_get_notifications;
      }

      await PortalSettings.findOneAndUpdate(
        { user_id: req.user.id },
        { $set: dataObject },
        { new: true, upsert: true }
      );
      res.json({
        success: true,
        response: "successful",
        msg: "Record updated successfully.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        errors: [
          {
            response: "error",
            msg: "Server Error",
          },
        ],
      });
    }
  }
);

router.post(
  "/portal_settings/invoice_details",
  auth,
  [
    check("company_address", "Company address is required").not().isEmpty(),
    check("gst_number", "GST number is required").not().isEmpty(),
    check("gst", "GST % is required").not().isEmpty(),
    check("igst", "IGST % is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company_address, gst_number, gst, igst } = req.body;

    try {
      var dataObject = {
        invoice_details: {
          company_address: company_address,
          gst_number: gst_number,
          gst: gst,
          igst: igst,
        },
      };

      await PortalSettings.findOneAndUpdate(
        { user_id: req.user.id },
        { $set: dataObject },
        { new: true, upsert: true }
      );
      res.json({
        success: true,
        response: "successful",
        msg: "Record updated successfully.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        errors: [
          {
            response: "error",
            msg: "Server Error",
          },
        ],
      });
    }
  }
);
module.exports = router;
