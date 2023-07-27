const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");
const sendGridAPiKey = process.env.SENDGRID_KEY;
const fromEmail = process.env.FROM_EMAIL;
const forgotPasswordTemplateId = process.env.FORGOTPASSWORD_TEMPLATEID;
const AccountApproval = process.env.ACCOUNT_APPROVAL;
const sgMail = require("@sendgrid/mail");
const Admin = require("../../../models/Admin");
const OtpTokens = require("../../../models/Usertokens");
const Categories = require("../../../models/Categories");
const Comment = require("../../../models/Comments");
const Subcategories = require("../../../models/Subcategories");
const Dropdown = require("../../../models/Dropdown");
const Tags = require("../../../models/Tags");
const Trends = require("../../../models/Trends");
const PortalSettings = require("../../../models/PortalSettings");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const User = require("../../../models/User");
const Reports = require("../../../models/Reports");
const { RequestContactExportCustomContactFilter } = require("sib-api-v3-sdk");
const AdsSidebar = require("../../../models/AdsSidebar");

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
router.get("/", auth, async (req, res) => {
  try {
    var user = await Admin.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
router.get("/link-expiry-check/:id", async (req, res) => {
  try {
    var user = await Admin.findById(req.params.id).select("-password");

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !user) {
      return res.json({ status: 2 });
    } else if (user) {
      if (user.verification_link_expire) {
        return res.json({
          success: false,
        });
      } else {
        return res.json({
          success: true,
        });
      }
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
// @route    POST /v1/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  "/login",
  [
    check("email", "Registered email is required").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      var role = 0;
      let user = await Admin.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              response: "error",
              param: "email",
              msg: "Invalid email or password.",
            },
          ],
        });
      }
      if (user && user.account_status == false) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Your account is under review.",
            },
          ],
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              response: "error",
              param: "password",
              msg: "Invalid email or password.",
            },
          ],
        });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            response: "successful",
            msg: "User is successfully logged in",
            data: {
              token: token,
              userRole: user.user_role,
            },
          });
        }
      );
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

router.put(
  "/change_password_with_auth",
  [
    auth,
    [
      check("previous_password", "Password is not correct").matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
      ),
      check(
        "new_password",
        "New password should have( one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long )"
      ).matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
      ),
      check(
        "confirm_password",
        "Confirm Password should matched with new password"
      ).matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
      ),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    var err = [];
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { previous_password, new_password, confirm_password } = req.body;

    const user = await Admin.findOne({ _id: req.user.id });
    const isMatch = await bcrypt.compare(previous_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        errors: [
          {
            success: false,
            response: "error",
            param: "previous_password",
            msg: "Invalid previous password",
          },
        ],
      });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({
        errors: [
          {
            success: false,
            response: "error",
            param: "confirm_password",
            msg: "Confirm password does not matched with new password",
          },
        ],
      });
    }

    // Build passwordObject
    const salt = await bcrypt.genSalt(10);

    const passwordObject = {};
    if (new_password)
      passwordObject.password = await bcrypt.hash(new_password, salt);
    passwordObject.updated_at = new Date();

    try {
      // Using upsert option (creates new doc if no match is found):
      let personalData = await Admin.findOneAndUpdate(
        { _id: req.user.id },
        { $set: passwordObject }
      );
      res.json({
        success: true,
        response: "successful",
        msg: "Password is updated successfully",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post(
  "/forgotPassword",
  [check("email", "Please include a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let user = await Admin.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              response: "error",
              param: "email",
              msg: "Please use registered email",
            },
          ],
        });
      } else {
        let userID = user._id;
        // const salt = await bcrypt.genSalt(10);
        // generated otp
        var email_verification_code = Math.floor(
          100000 + Math.random() * 900000
        );
        // set expiry for OTP
        var otp_expired = new Date();
        otp_expired.setMinutes(otp_expired.getMinutes() + 5);
        const passwordObject = {};
        passwordObject.otp_expired = otp_expired;
        passwordObject.otp = email_verification_code;
        passwordObject.updated_at = new Date();

        try {
          let personalData = {};

          personalData = await Admin.findOneAndUpdate(
            { _id: user._id },
            { $set: passwordObject }
          );
          // Using upsert option (creates new doc if no match is found):

          sgMail.setApiKey(sendGridAPiKey);
          const msg = {
            to: email,
            from: fromEmail,
            templateId: forgotPasswordTemplateId,
            dynamicTemplateData: {
              subject: "Forgot Password",
              username: user.first_name,
              otp: passwordObject.otp,
            },
          };
          sgMail.send(msg, (error, result) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Send email to user Done!");
              return res.json({
                success: true,
                response: "successful",
                msg: "Please check your email for OTP verification.",
                data: user._id,
              });
            }
          });
        } catch (err) {
          console.error(err.message);
          res.status(500).send("Server Error");
        }
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/verifyOtp/:id",
  [check("otp", "OTP must be of 6 digit numbers").matches(/^[0-9]{6}$/)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { otp } = req.body;
    let user_id = req.params.id;
    try {
      function diff_minutes(dt2, dt1) {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.round(diff);
      }
      let userData = await Admin.findOne({ _id: user_id });

      // console.log(userData);

      if (userData.otp) {
        let otp_expired = userData.otp_expired;
        let currentDateTime = new Date();
        let expiredDateTime = new Date(otp_expired);
        var expiringDifference = diff_minutes(currentDateTime, expiredDateTime);

        if (otp == userData.otp) {
          if (expiringDifference < 0) {
            var user_otpToken = Math.random()
              .toString(36)
              .substring(2, 10)
              .concat(expiredDateTime.toISOString());
            var userDetails = {};
            userDetails.otp = null;
            userDetails.otp_expired = currentDateTime;
            userDetails.otp_token = user_otpToken;

            await Admin.findOneAndUpdate(
              { _id: user_id },
              { $set: userDetails }
            );

            var new_OtpTokens = new OtpTokens({
              user_id: user_id,
              otp_token: user_otpToken,
              expiredat: userDetails.otp_expired,
            });

            const otpsaved = await new_OtpTokens.save();

            res.json({
              success: true,
              msg: "OTP verified successfully",
              data: {
                datasaved: otpsaved,
                otptoken: user_otpToken,
              },
            });
          } else {
            res.status(400).send({
              success: false,
              errors: [
                {
                  msg: "OTP get expired",
                  param: "otp",
                  location: "body",
                },
              ],
            });
          }
        } else if (otp != userData.otp) {
          res.status(400).send({
            success: false,
            errors: [
              {
                msg: "Invalid OTP",
                param: "otp",
                location: "body",
              },
            ],
          });
        }
      } else {
        res.status(400).send({
          success: false,
          errors: [
            {
              msg: "No Record Found with this id",
              param: "id",
              location: "url",
            },
          ],
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

router.put(
  "/change_password/:id/:otptoken",
  [
    [
      check(
        "password",
        "New password should have( one uppercase , one lower case, one special char, one digit and min 6 char long )"
      ).matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
      ),
      check(
        "confirm_password",
        "Confirm Password should matched with new password"
      ).matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
      ),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    var err = [];
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { password, confirm_password } = req.body;
    let user_id = req.params.id;
    let user_otptoken = req.params.otptoken;
    let userrole = 1;

    let token = await OtpTokens.findOne({
      otp_token: user_otptoken,
      user_id: user_id,
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            response: "error",
            param: "otp_token",
            msg: "Page Not Found",
          },
        ],
      });
    }

    let user = await Admin.findOne({ _id: user_id });

    if (user.otp_token !== user_otptoken) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            response: "error",
            param: "otp_token",
            msg: "Link Expired",
          },
        ],
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            response: "error",
            param: "confirm_password",
            msg: "Confirm password does not matched with new password",
          },
        ],
      });
    }

    // Build passwordObject
    const salt = await bcrypt.genSalt(10);

    const passwordObject = {};
    if (password) passwordObject.password = await bcrypt.hash(password, salt);
    // if (password) passwordObject.verification_link_expire = 1;
    passwordObject.updated_at = new Date();
    passwordObject.otp_token = null;

    try {
      let personalData = null;
      // Using upsert option (creates new doc if no match is found):
      personalData = await Admin.findOneAndUpdate(
        { _id: user_id },
        { $set: passwordObject }
      );
      if (personalData) {
        res.json({
          success: true,
          response: "successful",
          msg: "Password is updated successfully",
        });
      } else {
        res.json({
          success: false,
          response: "error",
          msg: "No record found with user id",
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

// @route    Get /v1/admin/settings/profile
// @desc     get user details
// @access   Private

router.get("/settings/profile", auth, async (req, res) => {
  try {
    let user = await Admin.findOne(
      { _id: req.user.id },
      { first_name: 1, email: 1, "profile.author_name": 1, "profile.bio": 1 }
    );
    if (user) {
      res.json({
        success: true,
        response: "successful",
        msg: "Data fetched",
        data: user,
      });
    } else {
      res.status(400).json({
        success: false,
        response: "error",
        msg: "No user found",
      });
    }
  } catch (err) {
    // console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

// @route    Post /v1/admin/settings/profile
// @desc     change user details
// @access   Private

router.put("/settings/profile", auth, async (req, res) => {
  const { first_name, author_name, bio } = req.body;

  try {
    var profileData = await Admin.findOne({ _id: req.user.id });

    if (first_name) profileData.first_name = first_name;
    if (author_name) profileData.profile.author_name = author_name;
    if (bio) profileData.profile.bio = bio;

    // return console.log("profile data" , profileData)

    let userUpdated = await Admin.findOneAndUpdate(
      { _id: req.user.id },
      { $set: profileData }
    );

    res.json({
      success: true,
      response: "successful",
      msg: "User Profile Succesfuly Updated",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.get("/settings/social", auth, async (req, res) => {
  try {
    let user = await Admin.findOne(
      { _id: req.user.id },
      {
        "profile.facebook": 1,
        "profile.twitter": 1,
        "profile.dribble": 1,
        "profile.instagram": 1,
        "profile.github": 1,
        "profile.medium": 1,
      }
    );
    if (user) {
      res.json({
        success: true,
        response: "successful",
        msg: "Data fetched",
        data: user,
      });
    } else {
      res.json({
        success: false,
        response: "error",
        msg: "No user found",
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.put(
  "/settings/social",
  auth,
  [
    check("facebook", "Please enter a valid URL ").isURL(),
    check("twitter", "Please enter a valid URL ").isURL(),
    check("dribble", "Please enter a valid URL ").isURL(),
    check("instagram", "Please enter a valid URL ").isURL(),
    check("github", "Please enter a valid URL ").isURL(),
    check("medium", "Please enter a valid URL ").isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { facebook, twitter, dribble, instagram, github, medium } = req.body;

    try {
      var userSocialUpdate = await Admin.findOne({ _id: req.user.id });
      if (facebook) userSocialUpdate.profile.facebook = facebook;
      if (twitter) userSocialUpdate.profile.twitter = twitter;
      if (dribble) userSocialUpdate.profile.dribble = dribble;
      if (instagram) userSocialUpdate.profile.instagram = instagram;
      if (github) userSocialUpdate.profile.github = github;
      if (medium) userSocialUpdate.profile.medium = medium;

      let userSocialUpdated = await Admin.findOneAndUpdate(
        { _id: req.user.id },
        { $set: userSocialUpdate }
      );

      res.json({
        success: true,
        response: "successful",
        msg: "User Social Succesfuly Updated",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

router.post(
  "/add_category_subcategory",
  [auth, [check("title", "Title is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    var err = [];
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const {
        title,
        description,
        banners,
        pin_to_sidebar,
        category_id,
        publication_status,
      } = req.body;
      var unique_url_calculated = title
        .replace(/[^a-zA-Z ]/g, "")
        .split(" ")
        .join("-")
        .toLowerCase();
      if (category_id) {
        var categoryDetail = await Categories.findOne(
          { _id: category_id },
          { title: 1 }
        );
        if (categoryDetail) {
          unique_url_calculated = (categoryDetail.title + " " + title)
            .replace(/[^a-zA-Z ]/g, "")
            .split(" ")
            .join("-")
            .toLowerCase();
        }
        const subcategoryExists = await Subcategories.findOne(
          {
            $or: [{ title: title }, { slug: unique_url_calculated }],
            category_id: category_id,
            publication_status: publication_status,
          },
          { _id: 1 }
        );
        if (subcategoryExists) {
          return res.status(400).json({
            success: false,
            errors: [
              {
                response: "error",
                param: "title",
                msg: "Title already exists.",
              },
            ],
          });
        }
        var objectData = {};
        objectData.title = title;
        objectData.description = description;
        objectData.slug = unique_url_calculated;
        objectData.category_id = category_id;
        objectData.banners = banners;
        objectData.publication_status = publication_status;
        objectData.deleted = false;
        objectData.created_at = new Date();
        const newSubcategory = new Subcategories(objectData);

        await newSubcategory.save();
      } else {
        const categoryExists = await Categories.findOne(
          {
            $or: [{ title: title }, { slug: unique_url_calculated }],
            publication_status: publication_status,
          },
          { _id: 1 }
        );
        if (categoryExists) {
          return res.status(400).json({
            success: false,
            errors: [
              {
                response: "error",
                param: "title",
                msg: "Title already exists.",
              },
            ],
          });
        }
        var objectData = {};
        objectData.title = title;
        objectData.description = description;
        objectData.slug = unique_url_calculated;
        objectData.pin_to_sidebar = pin_to_sidebar;
        objectData.banners = banners;
        objectData.publication_status = publication_status;
        objectData.deleted = false;
        objectData.created_at = new Date();
        const newCategory = new Categories(objectData);

        await newCategory.save();
      }

      res.json({
        success: true,
        response: "successful",
        msg: "Record added successfully.",
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

router.get("/get_categories_subcategories", auth, async (req, res) => {
  try {
    const { category_id, _id } = req.query;
    const userId = req.user.id;
    //get user Detail
    const userDetail = await Admin.findOne(
      { _id: userId },
      { categories_id: 1, subcategories_id: 1, _id: 0 }
    );
    const categoryIds = userDetail.categories_id;
    var isSubcategory = false;
    var search = {
      deleted: false,
    };
    if (categoryIds.length > 0) {
      search["_id"] = { $in: categoryIds };
    }
    var data = [];
    if (category_id) {
      isSubcategory = true;
      search["category_id"] = category_id;
    }
    if (_id) {
      search["_id"] = _id;
    }
    if (isSubcategory) {
      if (_id) {
        data = await Subcategories.findOne(search).populate("category_id");
      } else {
        data = await Subcategories.find(search).populate("category_id");
      }
    } else {
      if (_id) {
        data = await Categories.findOne(search);
      } else {
        data = await Categories.find(search);
      }
    }

    res.json({
      success: true,
      response: "successful",
      msg: "Data fetched successfully.",
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

router.get("/get_selected_categories_subcategories", auth, async (req, res) => {
  try {
    const { category_ids } = req.query;
    var categories = JSON.parse(category_ids);

    const userId = req.user.id;
    //get user Detail
    const userDetail = await Admin.findOne(
      { _id: userId },
      { subcategories_id: 1, _id: 0 }
    );
    const subCategoriesids = userDetail.subcategories_id;

    var selectedCategories = [];
    categories.map(async (id) => {
      selectedCategories.push(ObjectId(id));
      return ObjectId(id);
    });

    var search = {
      publication_status: true,
      category_id: selectedCategories,
    };

    if (subCategoriesids.length > 0) {
      search["_id"] = { $in: subCategoriesids };
    }
    var data = await Subcategories.find(search);
    res.json({
      success: true,
      response: "successful",
      msg: "Data fetched successfully.",
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

router.get(
  "/get_selected_categories_subcategories_trends",
  auth,
  async (req, res) => {
    try {
      const { subcategories_ids } = req.query;
      var subcategories = JSON.parse(subcategories_ids);

      var selectedSubcategories = [];
      subcategories.map(async (id) => {
        selectedSubcategories.push(ObjectId(id));
        return ObjectId(id);
      });
      var result = await Trends.find(
        {
          subcategory_ids: { $in: selectedSubcategories },
        },
        {
          title: 1,
        }
      );

      res.json({
        success: true,
        response: "successful",
        msg: "Data fetched successfully.",
        data: result,
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

router.put(
  "/update_category_subcategory",
  [auth, [check("title", "Title is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    var err = [];
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const {
        title,
        description,
        banners,
        pin_to_sidebar,
        category_id,
        publication_status,
        _id,
      } = req.body;
      var unique_url_calculated = title
        .replace(/[^a-zA-Z ]/g, "")
        .split(" ")
        .join("-")
        .toLowerCase();
      if (category_id) {
        var categoryDetail = await Categories.findOne(
          { _id: category_id },
          { title: 1 }
        );
        if (categoryDetail) {
          unique_url_calculated = (categoryDetail.title + " " + title)
            .replace(/[^a-zA-Z ]/g, "")
            .split(" ")
            .join("-")
            .toLowerCase();
        }
        const subcategoryExists = await Subcategories.findOne(
          {
            $or: [{ title: title }, { slug: unique_url_calculated }],
            category_id: category_id,
            publication_status: publication_status,
            _id: { $ne: ObjectId(_id) },
          },
          { _id: 1 }
        );
        if (subcategoryExists) {
          return res.status(400).json({
            success: false,
            errors: [
              {
                response: "error",
                param: "title",
                msg: "Title already exists.",
              },
            ],
          });
        }
        var objectData = {};
        objectData.title = title;
        objectData.description = description;
        objectData.slug = unique_url_calculated;
        objectData.category_id = category_id;
        objectData.banners = banners;
        objectData.publication_status = publication_status;
        objectData.updated_at = new Date();
        await Subcategories.findOneAndUpdate(
          { _id: _id },
          { $set: objectData }
        );
      } else {
        const categoryExists = await Categories.findOne(
          {
            $or: [{ title: title }, { slug: unique_url_calculated }],
            publication_status: publication_status,
            _id: { $ne: ObjectId(_id) },
          },
          { _id: 1 }
        );
        if (categoryExists) {
          return res.status(400).json({
            success: false,
            errors: [
              {
                response: "error",
                param: "title",
                msg: "Title already exists.",
              },
            ],
          });
        }
        var objectData = {};
        objectData.title = title;
        objectData.description = description;
        objectData.slug = unique_url_calculated;
        objectData.pin_to_sidebar = pin_to_sidebar;
        objectData.banners = banners;
        objectData.publication_status = publication_status;
        objectData.updated_at = new Date();
        await Categories.findOneAndUpdate({ _id: _id }, { $set: objectData });
      }

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
  "/upload_subcategories",
  upload.single("file"),
  async (req, res) => {
    try {
      const fileRows = [];
      const rejectedRecords = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", async (row) => {
          //console.log(row);
          fileRows.push(row);
          var categoryDetail = await Categories.findOne(
            { title: row.category_name },
            { _id: 1 }
          );
          if (!categoryDetail) {
            rejectedRecords.push(row);
          } else {
            var unique_url_calculated =
              row.category_name +
              " " +
              row.title
                .replace(/[^a-zA-Z ]/g, "")
                .split(" ")
                .join("-")
                .toLowerCase();
            var objForUpload = {
              title: row.title,
              description: row.description,
              slug: unique_url_calculated,
              category_id: categoryDetail._id,
              banners: [],
              publication_status: row.publication_status == 1 ? true : false,
              updated_at: new Date(),
              deleted: false,
            };
            var result = await Subcategories.findOneAndUpdate(
              { title: row.title },
              { $set: objForUpload },
              { new: true, upsert: true }
            );
          }
        })

        .on("end", () => {
          fs.unlinkSync(req.file.path);
          if (fileRows.length == 0) {
            return res.json({
              status: 0,
              response: "error",
              msg: "Please upload valid file",
            });
          }
          res.json({
            status: 1,
            response: "successful",
            msg: "File details updated successfully",
            data: {
              rejectedRecords: rejectedRecords,
            },
          });
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

router.post("/add_tags", auth, async (req, res) => {
  const { tags } = req.body;

  try {
    if (tags && tags.length > 0) {
      try {
        await Tags.insertMany(tags, { ordered: false });
      } catch (e) {
        console.log("Has some duplicate entries");
      }
    }
    res.json({
      success: true,
      msg: "Record added successfully.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.get("/get_tags", auth, async (req, res) => {
  const { _id } = req.query;

  try {
    var search = {};
    var data = [];
    if (_id) {
      search._id = _id;
      data = await Tags.findOne(search);
    } else {
      data = await Tags.find(search);
    }
    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: data,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.put(
  "/update_tag",
  [auth, [check("tag", "Tag name is required").not().isEmpty()]],
  async (req, res) => {
    const { _id, tag_name, tag_status } = req.body;

    try {
      var search = {};
      var data = [];
      if (_id) {
        search._id = _id;
        var updateObject = {};
        updateObject.tag_name = tag_name;
        updateObject.tag_status = tag_status;
        updateObject.updated_at = new Date();
        data = await Tags.findOneAndUpdate(search, { $set: updateObject });
      }
      res.json({
        success: true,
        msg: "Record upated successfully.",
        data: data,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

router.post("/convert_string_to_array", async (req, res) => {
  const { regions } = req.body;

  try {
    var data = regions.split(", ");
    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: data,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.post(
  "/addDropdown",
  [
    check("name", "Please enter valid name").not().isEmpty(),
    check("options", "Please enter valid options").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, options } = req.body;

    try {
      var dropdownObject = {};
      if (options.length > 0) {
        dropdownObject.options = options;
      } else {
        dropdownObject.options = [];
      }
      dropdownObject.name = name;

      await Dropdown.findOneAndUpdate(
        { name: name },
        { $set: dropdownObject },
        { new: true, upsert: true }
      );
      //await user.save();

      res.json({
        success: true,
        msg: "Record updated successfully",
      });
    } catch (err) {
      console.error(err.message);

      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

router.post(
  "/add_trend",
  auth,
  [
    check("title", "Please enter valid title").not().isEmpty(),
    check("sub_heading", "Please enter valid sub heading").not().isEmpty(),
    check("summary", "Please enter valid summary").not().isEmpty(),
    check("review_summary", "Please enter valid review summary")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      category_ids,
      subcategory_ids,
      tags_ids,
      focus_tags_ids,
      title,
      sub_heading,
      summary,
      review_summary,
      reference_links,
      featured_images,
      video_link,
      read_time,
      h1_tag,
      meta_content,
      head_scripts,
      body_scripts,
      popularity,
      inventiveness,
      engagement,
      human_centricity,
      score,
      gender,
      age_group,
      geography,
      mern2_compass,
      format,
      author_type,
      publication_status,
      related_trend_ids,
      preview_image,
      featured,
      views_count_start_from,
    } = req.body;

    try {
      var unique_url_calculated = title
        .replace(/[^a-zA-Z ]/g, "")
        .split(" ")
        .join("-")
        .toLowerCase();
      var dataObject = {};

      dataObject.category_ids = category_ids;
      dataObject.subcategory_ids = subcategory_ids;
      if (related_trend_ids.length > 0) {
        dataObject.related_trend_ids = related_trend_ids;
      }
      dataObject.tags_ids = tags_ids;
      dataObject.focus_tags_ids = focus_tags_ids;
      dataObject.title = title;
      dataObject.sub_heading = sub_heading;
      dataObject.summary = summary;
      dataObject.review_summary = review_summary;
      dataObject.reference_links = reference_links;
      dataObject.slug = unique_url_calculated;
      dataObject.featured_images = featured_images;
      dataObject.featured = featured;
      dataObject.video_link = video_link;
      dataObject.read_time = read_time;
      dataObject.seo = {};
      dataObject.seo.h1_tag = h1_tag;
      dataObject.seo.meta_content = meta_content;
      dataObject.seo.head_scripts = head_scripts;
      dataObject.seo.body_scripts = body_scripts;
      dataObject.popularity = popularity;
      dataObject.inventiveness = inventiveness;
      dataObject.engagement = engagement;
      dataObject.human_centricity = human_centricity;
      dataObject.score = score;
      dataObject.views_count_start_from = views_count_start_from;
      dataObject.gender = gender;
      dataObject.age_group = age_group;
      dataObject.geography = geography;
      dataObject.mern2_compass = mern2_compass;
      dataObject.format = format;
      dataObject.author = req.user.id;
      dataObject.author_type = author_type;
      dataObject.publication_status = publication_status;
      dataObject.preview_image = preview_image;
      dataObject.deleted = 0;
      dataObject.comment_status = true;
      dataObject.created_at = new Date();
      var checkRecordExists = await Trends.findOne(
        { title: title, slug: unique_url_calculated },
        { _id: 1 }
      );
      if (!checkRecordExists) {
        await Trends.findOneAndUpdate(
          { title: title, slug: unique_url_calculated },
          { $set: dataObject },
          { new: true, upsert: true }
        );
        res.json({
          success: true,
          msg: "Record added successfully",
        });
      } else {
        res.status(400).send({
          success: false,
          errors: [
            {
              msg: "Title already exists",
              param: "title",
              location: "body",
            },
          ],
        });
      }

      // await Dropdown.findOneAndUpdate(
      //   { name: name },
      //   { $set: dropdownObject },
      //   { new: true, upsert: true }
      // );
      //await user.save();
    } catch (err) {
      console.error(err.message);

      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

router.post(
  "/edit_trend",
  auth,
  [
    check("title", "Please enter valid title").not().isEmpty(),
    check("sub_heading", "Please enter valid sub heading").not().isEmpty(),
    check("summary", "Please enter valid summary").not().isEmpty(),
    check("review_summary", "Please enter valid review summary")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      category_ids,
      subcategory_ids,
      tags_ids,
      focus_tags_ids,
      title,
      sub_heading,
      summary,
      review_summary,
      reference_links,
      featured_images,
      video_link,
      read_time,
      h1_tag,
      meta_content,
      head_scripts,
      body_scripts,
      popularity,
      inventiveness,
      engagement,
      human_centricity,
      score,
      gender,
      age_group,
      geography,
      mern2_compass,
      format,
      author_type,
      publication_status,
      preview_image,
      featured,
      views_count_start_from,
      related_trend_ids,
      _id,
    } = req.body;

    try {
      var unique_url_calculated = title
        .replace(/[^a-zA-Z ]/g, "")
        .split(" ")
        .join("-")
        .toLowerCase();
      var dataObject = {};

      dataObject.category_ids = category_ids;
      dataObject.subcategory_ids = subcategory_ids;
      if (related_trend_ids.length > 0) {
        dataObject.related_trend_ids = related_trend_ids;
      }
      dataObject.tags_ids = tags_ids;
      dataObject.focus_tags_ids = focus_tags_ids;
      dataObject.title = title;
      dataObject.sub_heading = sub_heading;
      dataObject.summary = summary;
      dataObject.review_summary = review_summary;
      dataObject.reference_links = reference_links;
      //dataObject.slug = unique_url_calculated;
      dataObject.featured_images = featured_images;
      dataObject.featured = featured;
      dataObject.video_link = video_link;
      dataObject.read_time = read_time;
      dataObject.seo = {};
      dataObject.seo.h1_tag = h1_tag;
      dataObject.seo.meta_content = meta_content;
      dataObject.seo.head_scripts = head_scripts;
      dataObject.seo.body_scripts = body_scripts;
      dataObject.popularity = popularity;
      dataObject.inventiveness = inventiveness;
      dataObject.engagement = engagement;
      dataObject.human_centricity = human_centricity;
      dataObject.score = score;
      dataObject.views_count_start_from = views_count_start_from;
      dataObject.gender = gender;
      dataObject.age_group = age_group;
      dataObject.geography = geography;
      dataObject.mern2_compass = mern2_compass;
      dataObject.format = format;
      dataObject.author = req.user.id;
      dataObject.author_type = author_type;
      dataObject.preview_image = preview_image;
      dataObject.publication_status = publication_status;
      dataObject.deleted = 0;
      dataObject.comment_status = true;
      dataObject.created_at = new Date();
      var checkRecordExists = await Trends.findOne({ _id: _id }, { _id: 1 });
      if (checkRecordExists) {
        await Trends.findOneAndUpdate(
          { _id: _id },
          { $set: dataObject },
          { new: true, upsert: true }
        );
        res.json({
          success: true,
          msg: "Record updated successfully",
        });
      } else {
        res.status(400).send({
          success: false,
          errors: [
            {
              msg: "Something went wrong!",
              param: "title",
              location: "body",
            },
          ],
        });
      }

      // await Dropdown.findOneAndUpdate(
      //   { name: name },
      //   { $set: dropdownObject },
      //   { new: true, upsert: true }
      // );
      //await user.save();
    } catch (err) {
      console.error(err.message);

      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

router.post("/upload_trends", auth, async (req, res) => {
  try {
    var dropdownData = await Dropdown.find();
    var regionsArray = dropdownData.filter(function (el) {
      return el.name == "regions" && el.options;
    });
    var regions = regionsArray[0].options;
    var genderArray = dropdownData.filter(function (el) {
      return el.name == "gender" && el.options;
    });
    var genders = genderArray[0].options;
    var ageGroupArray = dropdownData.filter(function (el) {
      return el.name == "age_group" && el.options;
    });
    var age_group = ageGroupArray[0].options;
    var mern2CompassArray = dropdownData.filter(function (el) {
      return el.name == "mern2_compass" && el.options;
    });
    var mern2_compass = mern2CompassArray[0].options;

    var categoryDetail = await Categories.find({}, { title: 1 });
    var subcategoryDetail = await Subcategories.find({}, { title: 1 }).populate(
      "category_id",
      { title: 1 }
    );
    var tagsDetail = await Tags.find({ tag_status: true }, { tag_name: 1 });
    const fileRows = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", async (row) => {
        var title = row.title.trim();
        var unique_url_calculated = title
          .replace(/[^a-zA-Z ]/g, "")
          .split(" ")
          .join("-")
          .toLowerCase();
        var dataObject = {};
        var catArray = [];
        var subcatArray = [];
        var tagsArray = [];
        var focusedTagsArray = [];

        catArray = row.categories.split(",").map((response) => {
          var category = categoryDetail.filter((ress) => {
            if (response.trim() == ress.title) {
              return ress._id;
            }
          });
          if (category && category.length > 0) {
            return category[0]._id;
          }
        });
        row.subcategories.split(";").map((categoriesAndSubcategories) => {
          var subCat = categoriesAndSubcategories.split("=>");
          if (subCat.length == 2) {
            subCat[1].split(",").map((singleSubCategory) => {
              var subcategory = subcategoryDetail.filter((ress) => {
                if (
                  singleSubCategory == ress.title &&
                  ress.category_id.title == subCat[0]
                ) {
                  return ress._id;
                }
              });
              if (subcategory && subcategory.length > 0) {
                subcatArray.push(subcategory[0]._id);
                return subcategory[0]._id;
              }
            });
          }
        });

        row.tags_ids.split(",").map((singleTag) => {
          tagsDetail.filter((ress) => {
            if (ress && ress.tag_name == singleTag.trim()) {
              tagsArray.push(ress._id);
              return ress._id;
            }
          });
        });
        row.focus_tags_ids.split(",").map((singleTag) => {
          tagsDetail.filter((ress) => {
            if (ress && ress.tag_name == singleTag.trim()) {
              focusedTagsArray.push(ress._id);
              return ress._id;
            }
          });
        });
        var seo = {};
        seo.h1_tag = title;
        seo.meta_content = row.meta_content;
        dataObject.category_ids = catArray;
        dataObject.subcategory_ids = subcatArray;
        dataObject.tags_ids = tagsArray;
        dataObject.comment_status = true;
        dataObject.focus_tags_ids = focusedTagsArray;
        dataObject.title = title;
        dataObject.sub_heading = row.sub_heading.trim();
        dataObject.summary = row.summary.trim();
        dataObject.review_summary = row.review_summary.trim();
        dataObject.reference_links = row.reference_links;
        dataObject.slug = unique_url_calculated;
        dataObject.preview_image = preview_image;
        dataObject.featured = featured;
        dataObject.featured_images = row.featured_images.split(",");
        dataObject.video_link = row.video_link && row.video_link.split(",");
        dataObject.read_time = Number(row.read_time);
        dataObject.seo = seo;
        dataObject.popularity = Number(row.popularity);
        dataObject.inventiveness = Number(row.inventiveness);
        dataObject.engagement = Number(row.engagement);
        dataObject.human_centricity = Number(row.human_centricity);
        dataObject.score = Number(row.score);
        dataObject.views_count_start_from = row.views_count_start_from
          ? Number(row.views_count_start_from)
          : 0;
        dataObject.gender = row.gender.split(",").map((ress) => {
          return genders.indexOf(ress);
        });
        dataObject.age_group = row.age_group.split(",").map((ress) => {
          return age_group.indexOf(ress);
        });
        dataObject.geography = row.geography.split(",").map((num) => {
          return regions.indexOf(num);
        });
        dataObject.mern2_compass = row.mern2_compass
          .split(",")
          .map((ress) => {
            return mern2_compass.indexOf(ress);
          });
        dataObject.format = 1;
        dataObject.author = req.user.id;
        dataObject.author_type = 1;
        dataObject.publication_status =
          row.publication_status == 1 ? true : false;
        dataObject.deleted = 0;
        dataObject.created_at = new Date();
        if (
          dataObject.category_ids.length == 0 ||
          dataObject.subcategory_ids.length == 0 ||
          focusedTagsArray.length == 0 ||
          title == ""
        ) {
          fileRows.push(row);
        } else {
          await Trends.findOneAndUpdate(
            { title: title, slug: unique_url_calculated },
            { $set: dataObject },
            { new: true, upsert: true }
          );
        }
      })

      .on("end", () => {
        fs.unlinkSync(req.file.path);
        if (fileRows.length != 0) {
          return res.json({
            success: false,
            response: "error",
            msg: "Please upload valid file",
            data: fileRows,
          });
        }
        res.json({
          success: true,
          response: "successful",
          msg: "File details updated successfully",
          data: fileRows,
        });
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

router.post("/upload_image", async (req, res) => {
  try {
    res.json({
      success: true,
      response: "successful",
      msg: "File details updated successfully",
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

router.get("/get_trends", auth, async (req, res) => {
  const userId = req.user.id;
  const getUserRole = await Admin.findOne({ _id: userId, user_role: 1 });

  const { _id, published, draft, trash, featured } = req.query;
  const pageNo = req.query?.pageNo ? req.query?.pageNo : 1;
  const showData = 10;
  const removeData = (pageNo - 1) * showData;
  const sortData = { created_at: -1 };
  try {
    var search = {};
    if (getUserRole) {
      search.author = userId;
    }

    if (published) {
      search.deleted = false;
      search.publication_status = true;
    }
    if (draft) {
      search.publication_status = false;
      search.deleted = false;
    }
    if (trash) {
      search.deleted = true;
    }
    if (featured) {
      search.featured = true;
    }

    const totalCount = await Trends.count(search);
    var data = [];
    if (_id) {
      search._id = _id;
      data = await Trends.findOne(search);
    } else {
      data = await Trends.find(search, {
        subcategory_ids: 1,
        category_ids: 1,
        tags_ids: 1,
        focus_tags_ids: 1,
        title: 1,
        slug: 1,
        sub_heading: 1,
        preview_image: 1,
        featured_images: 1,
        video_link: 1,
        read_time: 1,
        seo: 1,
        popularity: 1,
        inventiveness: 1,
        engagement: 1,
        human_centricity: 1,
        score: 1,
        views_count_start_from: { ifNull: ["views_count_start_from", 0] },
        gender: 1,
        age_group: 1,
        geography: 1,
        mern2_compass: 1,
        format: 1,
        author: 1,
        author_type: 1,
        comment_status: 1,
        deleted: 1,
        created_at: 1,
        updated_at: 1,
        featured: { $ifNull: ["$featured", false] },
        publication_status: { $ifNull: ["$publication_status", false] },
      })
        .sort(sortData)
        .skip(removeData)
        .limit(showData)
        .populate("category_ids", { title: 1 })
        .populate("subcategory_ids", { title: 1 })
        .populate("focus_tags_ids", { tag_name: 1 })
        .populate("author", { first_name: 1 });
    }
    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: {
        totalCount: totalCount,
        trends: data,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.get("/get_trends_ids_info", auth, async (req, res) => {
  const { _id } = req.query;

  try {
    var dropdownData = await Dropdown.find();
    var regionsArray = dropdownData.filter(function (el) {
      return el.name == "regions" && el.options;
    });
    var regions = regionsArray[0].options;
    var genderArray = dropdownData.filter(function (el) {
      return el.name == "gender" && el.options;
    });
    var genders = genderArray[0].options;
    var ageGroupArray = dropdownData.filter(function (el) {
      return el.name == "age_group" && el.options;
    });
    var age_group = ageGroupArray[0].options;
    var mern2CompassArray = dropdownData.filter(function (el) {
      return el.name == "mern2_compass" && el.options;
    });
    var mern2_compass = mern2CompassArray[0].options;
    var formatArray = dropdownData.filter(function (el) {
      return el.name == "format" && el.options;
    });
    var format = formatArray[0].options;

    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: {
        regions: regions,
        genders: genders,
        age_group: age_group,
        mern2_compass: mern2_compass,
        format: format,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});
router.get("/portal_settings", auth, async (req, res) => {
  try {
    var data = await PortalSettings.findOne({ user_id: req.user.id });
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
        { $set: { payment_gateways: dataObject } },
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
      var dataObject = {};
      dataObject.invoice_details = {};
      dataObject.invoice_details.company_address = company_address;
      dataObject.invoice_details.gst_number = gst_number;
      dataObject.invoice_details.gst = gst;
      dataObject.invoice_details.igst = igst;

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

// @route    Get api/ -- get
// @desc     get the cultrue warrior registration list
// @access   Private
router.get("/mern2_warrior_list/:pageNo", auth, async (req, res) => {
  try {
    const pageNo = req.params.pageNo;
    const showData = 10;
    const removeData = (pageNo - 1) * showData;
    const sortData = { created_at: -1 };
    const { verified } = req.query;
    var searchQuery = {
      user_role: 1,
    };
    if (verified == 1) {
      searchQuery.verified = true;
    } else if (verified == 0) {
      searchQuery.verified = false;
    }
    const mern2WarriorList = await Admin.aggregate([
      {
        $match: searchQuery,
      },
      {
        $lookup: {
          from: "trends",
          localField: "author",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "totalTrends",
        },
      },
      {
        $addFields: {
          totalTrends: {
            $size: "$totalTrends",
          },
        },
      },
      {
        $skip: removeData,
      },
      {
        $limit: showData,
      },
      {
        $project: {
          user_name: 1,
          image: 1,
          first_name: 1,
          email: 1,
          totalTrends: 1,
          account_status: 1,
          verified: 1,
        },
      },
    ]);

    const mern2WarriorListTotalCount = await Admin.count(searchQuery);

    res.json({
      success: true,
      msg: "Data found Successfully",
      data: {
        totalCount: mern2WarriorListTotalCount,
        userList: mern2WarriorList,
      },
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

// @route    Put api/ publish_unpublish_subcategory
// @desc     for unpublish and publish the subcategories
// @access   Private
router.put(
  "/publish_unpublish_subcategory",
  auth,
  [
    check("subcategory_id", "subcategory_id  is required").isArray({
      min: 1,
      max: 50,
    }),
    check(
      "publication_status",
      "publication_status  is required , true or false"
    )
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const {
        subcategory_id,
        publication_status, // ture or false
      } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      if (subcategory_id.length == 0) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "subcategories ids are required",
            },
          ],
        });
      }

      const data = await Subcategories.updateMany(
        { _id: { $in: subcategory_id } },
        { $set: { publication_status: publication_status } }
      );

      if (data) {
        res.json({
          success: true,
          msg: "Record updated successfully",
        });
      }
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

// @route    Put api/ publish_unpublish_categories
// @desc     for unpublish and publish the subcategories
// @access   Private
router.put(
  "/publish_unpublish_categories",
  auth,
  [
    check("categories_id", "categories_id  is required").isArray({
      min: 1,
      max: 50,
    }),
    check(
      "publication_status",
      "publication_status  is required , true or false"
    )
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const {
        categories_id,
        publication_status, // ture or false
      } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const data = await Categories.updateMany(
        { _id: { $in: categories_id } },
        { $set: { publication_status: publication_status } }
      );
      const data2 = await Subcategories.updateMany(
        { category_id: { $in: categories_id } },
        { $set: { publication_status: publication_status } }
      );

      if (data && data2) {
        res.json({
          success: true,
          msg: "Record updated successfully",
        });
      }
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

// @route    Put api/ approve
// @desc     for unpublish and publish the subcategories
// @access   Private
router.put(
  "/approve",
  auth,
  [
    check("categories_id", "categories_id  is required").isArray({
      min: 1,
      max: 50,
    }),
    check(
      "publication_status",
      "publication_status  is required , true or false"
    )
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const {
        categories_id,
        publication_status, // ture or false
      } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const data = await Categories.updateMany(
        { _id: { $in: categories_id } },
        { $set: { publication_status: publication_status } }
      );
      const data2 = await Subcategories.updateMany(
        { category_id: { $in: categories_id } },
        { $set: { publication_status: publication_status } }
      );

      if (data && data2) {
        return res.json({
          success: true,
          msg: "Record updated successfully",
        });
      } else {
        return res.json({
          success: true,
          errors: {
            msg: "Something went wrong !",
          },
        });
      }
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

// @route    Put api/ approve_mern2_wirrior
// @desc     for approve the C- warrior account and set selected category's and subcategory's
// @access   Private
router.put(
  "/approve_mern2_warrior",
  auth,
  [
    check(
      "categories_id",
      "categories_id  is required. Must be array of ids"
    ).isArray({
      min: 1,
      max: 50,
    }),
    check(
      "subcategories_id",
      "subcategories_id  is required. Must be array of ids"
    ).isArray({
      min: 1,
      max: 50,
    }),
    check("password", "Password is required").not().isEmpty(),
    check("cw_id", "cw_id  is required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const { categories_id, subcategories_id, cw_id, password } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }
      const salt = await bcrypt.genSalt(10);

      const passwordObject = {};
      var newPass = await bcrypt.hash(password, salt);

      const setData = {
        verified: true,
        account_status: true,
        categories_id: categories_id,
        subcategories_id: subcategories_id,
        password: newPass,
      };
      const alreadyApprove = await Admin.findOne({
        _id: cw_id,
        verified: true,
      });
      if (alreadyApprove) {
        return res.json({
          success: true,
          msg: "Account already approved.",
          data: alreadyApprove,
        });
      } else {
        const result = await Admin.findOneAndUpdate(
          { _id: cw_id },
          { $set: setData },
          { new: true }
        );

        //send password email
        sgMail.setApiKey(sendGridAPiKey);
        const msg = {
          //to: "japkirat66@gmail.com",
          to: result.email,
          from: fromEmail,
          templateId: AccountApproval,
          dynamicTemplateData: {
            username: result.first_name,
            new_password: password,
            user_email: result.email,
            login_url: process.env.SITE_URL,
          },
        };
        sgMail.send(msg, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Send email to user Done!");
            return res.json({
              success: true,
              msg: "Account approved successfully.",
              data: result,
            });
          }
        });
      }
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

// @route    Put api/ publish_unpublish_trends
// @desc     For unpublish and publish the data
// @access   Private
router.put(
  "/publish_unpublish_trends",
  auth,
  [
    check("trend_id", "trend_id  is required").isArray({ min: 1, max: 50 }),
    check("publication_status", "publication_status  is required").isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }
      const { trend_id, publication_status } = req.body;
      var responsemsg =
        publication_status == 1 /// 0 for unpublish and 1 for publish
          ? "Trends publish successfully"
          : "Trends unpublish succssfully";

      //find and update many by ids
      const result = await Trends.updateMany(
        { _id: { $in: trend_id } },
        { $set: { publication_status: publication_status } }
      );

      if (result) {
        return res.json({
          success: true,
          msg: responsemsg,
        });
      } else {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Trends not found !",
            },
          ],
        });
      }
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

// @route    Put api/ toggle_comments_trends
// @desc     For unpublish and publish the data
// @access   Private
router.put(
  "/toggle_comments_trends",
  auth,
  [
    check("trend_id", "trend_id  is required").isArray({ min: 1, max: 50 }),
    check("comment_status", "comment_status  is required").isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }
      const { trend_id, comment_status } = req.body;
      var responsemsg =
        comment_status == 1
          ? "Comments are turned on."
          : "Comments are turned off!";

      //find and update many by ids
      const result = await Trends.updateMany(
        { _id: { $in: trend_id } },
        { $set: { comment_status: comment_status } }
      );

      if (result) {
        return res.json({
          success: true,
          msg: responsemsg,
        });
      } else {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Trends not found !",
            },
          ],
        });
      }
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

// @route    Get api/ -- get users_listing
// @desc     get the cultrue warrior registration list
// @access   Private
router.get("/users_listing/:pageNo", auth, async (req, res) => {
  try {
    const pageNo = req.params.pageNo;
    const showData = 10;
    const removeData = (pageNo - 1) * showData;
    const sortData = { created_at: -1 };
    const mern2WarriorList = await User.aggregate([
      {
        $match: {
          deleted: false,
          account_status: false,
        },
      },
      {
        $skip: removeData,
      },
      {
        $limit: showData,
      },
      {
        $project: {
          image: 1,
          username: 1,
          email: 1,
          deleted: 1,
          age: { $ifNull: ["$age", ""] },
          image: { $ifNull: ["$image", ""] },
          gender: { $ifNull: ["$age", ""] },
          phone: { $ifNull: ["$phone", ""] },
          account_status: 1,
          verified: 1,
        },
      },
    ]);
    const userCount = await User.count({
      deleted: false,
      account_status: false,
    });

    res.json({
      success: true,
      msg: "Data found Successfully",
      data: {
        totalCount: userCount,
        userList: mern2WarriorList,
      },
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

// @route    Post api/users/upload_report
// @desc     upload reports by admin
// @access   Private
router.post(
  "/save_reports",
  [
    check("title", "Title  is required").not().isEmpty(),
    check("docLink", "DocLink  is required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { title, docLink } = req.body;

      const userId = req.user.id;

      const saveData = new Reports({
        title: title,
        docLink: docLink,
        user_id: userId,
      });
      const result = await saveData.save();
      if (result) {
        res.json({
          success: true,
          msg: "Report saved successfully",
          data: result,
        });
      }
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

// @route    Put api/users/edit_report
// @desc     Edit reports
// @access   Private
router.put(
  "/edit_reports",
  [
    check("title", "Title  is required").not().isEmpty(),
    check("docId", "DocId  is required").not().isEmpty(),
    check("docLink", "DocLink  is required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { docId, title, docLink } = req.body;

      const userId = req.user.id;

      const saveData = {
        title: title,
        docLink: docLink,
        user_id: userId,
      };

      const result = await Reports.findOneAndUpdate(
        { _id: docId },
        { $set: saveData },
        { new: true }
      );

      if (result) {
        res.json({
          success: true,
          msg: "Report saved successfully",
          data: result,
        });
      } else {
        res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Record not found !",
            },
          ],
        });
      }
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

// @route    delete api/users/delete_reports/
// @desc     Delete reports
// @access   Private
router.delete("/delete_reports/:id", auth, async (req, res) => {
  try {
    const docId = req.params.id;
    const result = await Reports.findByIdAndRemove(docId);
    if (result) {
      res.json({
        success: true,
        msg: "Report deleted",
      });
    } else {
      res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Record not found !",
          },
        ],
      });
    }
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

// @route    get api/users/report_by_id/
// @desc     Delete reports
// @access   Private
router.get("/report_by_id/:id", auth, async (req, res) => {
  try {
    const docId = req.params.id;
    const result = await Reports.findById(docId);
    if (result) {
      res.json({
        success: true,
        msg: "Report fethed",
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Record not found !",
          },
        ],
      });
    }
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

// @route    get all api/users/reports/
// @desc     Get all reports
// @access   Private
router.get("/reports", auth, async (req, res) => {
  try {
    const result = await Reports.find({});
    if (result) {
      res.json({
        success: true,
        msg: "Reports fethed",
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Record not found !",
          },
        ],
      });
    }
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

// @route    put api/admin/trash_trends
// @desc     Login with otp -- user
// @access   Private

router.put(
  "/trash_trends",
  [
    check("trend_ids", "Trend ids must be array of ids").isArray({
      min: 1,
      max: 50,
    }),
    check("deleted", "deleted status is requird").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { trend_ids, deleted } = req.body;
      const trash = await Trends.updateMany(
        { _id: { $in: trend_ids } },
        { $set: { deleted: deleted } },
        { new: true }
      );
      var successmsg = "";
      deleted == true
        ? (successmsg = "Trends Trashed")
        : (successmsg = "Trends Restore.");
      res.json({
        success: true,
        msg: successmsg,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

// @route    put api/admin/update_profile_image
// @desc     update the profile image
// @access   Private
router.put(
  "/update_profile_image",
  auth,
  [check("profile_image", "Profile image  are is required").not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const { profile_image } = req.body;

      const udpateProfileImg = await Admin.findByIdAndUpdate(
        userId,
        { $set: { profile_image: profile_image } },
        { new: true }
      );
      res.json({
        success: true,
        msg: "Profile image has been updated.",
        data: udpateProfileImg,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

// @route    put api/admin/update_profile_image
// @desc     update the profile image
// @access   Private
router.get("/update_profile_image", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const udpateProfileImg = await Admin.findById(userId, { profile_image: 1 });
    res.json({
      success: true,
      msg: "Profile image fetched.",
      data: udpateProfileImg,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});
// @route    put api/admin/regenerate_pasword
// @desc     regenrate password
// @access   Private
router.put(
  "/regenerate_pasword",
  auth,
  [
    check(
      "password",
      "Password should have( one uppercase , one lower case, one special char, one digit and min 6 char long )"
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/),
    check(
      "confirm_password",
      "Confirm Password should matched with new password"
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/),
    check("admin_id", "Please enter the mern2 Wariior ID").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    var err = [];
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { password, confirm_password, admin_id } = req.body;

    let user = await Admin.findOne({ _id: admin_id });

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Confirm password does not matched with Password",
          },
        ],
      });
    }

    // Build passwordObject
    const salt = await bcrypt.genSalt(10);

    const passwordObject = {};
    if (password) passwordObject.password = await bcrypt.hash(password, salt);
    passwordObject.updated_at = new Date();

    try {
      // Using upsert option (creates new doc if no match is found):
      let personalData = await Admin.findOneAndUpdate(
        { _id: admin_id },
        { $set: passwordObject }
      );

      if (personalData) {
        sgMail.setApiKey(sendGridAPiKey);
        const msg = {
          to: user.email,
          from: fromEmail,
          templateId: forgotPasswordTemplateId,
          dynamicTemplateData: {
            subject: "Password Reset",
            username: user.first_name,
            otp: password,
          },
        };
        sgMail.send(msg, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Send email to user Done!");
            return res.json({
              success: true,
              msg: "Please check your email for OTP verification.",
            });
          }
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

// @route    put api/admin/power_transfer
// @desc     power transfer
// @access   Private
router.put(
  "power_transfer",
  auth,
  [
    check("power_given_to", "Power given to id is required.").not().isEmpty(),
    check("power_given_from", "Power given from id is required.")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      var err = [];
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { power_given_to, power_given_from } = req.body;
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

// @route    put api/admin/sidebar_ads
// @desc     save the sidebar ads
// @access   Private
router.put(
  "/sidebar_ads",
  [
    check("category_id", "Category id is required").not().isEmpty(),
    check("large_banner", "Large banner is required").not().isEmpty(),
    check("large_banner_url", "Large banner url id is required")
      .not()
      .isEmpty(),
    check("small_banner", "Small banner is required").not().isEmpty(),
    check("small_banner_url", "Small banner url is required").not().isEmpty(),
    check("section", "Section is required").isArray({
      min: 1,
      max: 50,
    }),
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const {
        category_id,
        large_banner,
        small_banner,
        large_banner_url,
        small_banner_url,
        section,
      } = req.body;

      const saveSideBarData = await AdsSidebar.findOneAndUpdate(
        {
          categories_id: category_id,
        },
        {
          $set: {
            categories_id: category_id,
            large_banner: large_banner,
            small_banner: small_banner,
            large_banner_url: large_banner_url,
            small_banner_url: small_banner_url,
            section: section,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      res.json({
        success: true,
        msg: "Data saved.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success: false,
        errors: [
          {
            msg: "Server error",
            param: "server",
            location: "body",
          },
        ],
      });
    }
  }
);

// @route    Get api/admin/sidebar_ads/:pageNo
// @desc     get the sidebar content
// @access   Private
router.get("/sidebar_ads/:pageNo", auth, async (req, res) => {
  try {
    const pageNo = req.params.pageNo;
    const showData = 10;
    const removeData = (pageNo - 1) * showData;
    const sortData = { created_at: -1 };

    const totalCount = await AdsSidebar.count({ deleted: false });
    const data = await AdsSidebar.aggregate([
      {
        $match: {
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: { $ifNull: ["$title", ""] },
              },
            },
          ],
          as: "categories_id",
        },
      },
      {
        $unwind: "$categories_id",
      },
      {
        $project: {
          _id: 1,
          categories_id: 1,
        },
      },

      {
        $skip: removeData,
      },
      {
        $limit: showData,
      },
    ]);

    if (data.length == 0) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "No record found !",
          },
        ],
      });
    }

    res.json({
      success: true,
      msg: "Record found",
      data: {
        listing: data,
        totalCount: totalCount,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

// @route    Get api/admin/sidebar_ads/:category_id
// @desc     get the sidebar content
// @access   Private
router.get("/one_sidebar_ads/:category_id", auth, async (req, res) => {
  try {
    const categoryId = req.params.category_id;

    const data = await AdsSidebar.findOne({
      deleted: false,
      categories_id: categoryId,
    });
    if (!data) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "No record found !",
          },
        ],
      });
    }

    res.json({
      success: true,
      msg: "Record found",
      data: data,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

// @route    Get api/admin/delete_sidebar_ads/:category_id
// @desc     get the sidebar content
// @access   Private
router.delete("/delete_sidebar_ads/:category_id", auth, async (req, res) => {
  try {
    const categoryId = req.params.category_id;

    const data = await AdsSidebar.findOneAndRemove({
      categories_id: categoryId,
    });
    if (!data) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "No record found !",
          },
        ],
      });
    }

    res.json({
      success: true,
      msg: "Record removed",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});
// @route    Get api/users/all_comments/:trend_id/:pageNo --- with auth /// need to update again
// @desc     Get all comments
// @access   Public -- \for get the all commentes
// router.get("/all_comments_admin/:trend_id/:pageNo", auth,  async (req, res) => {
//   try {
//     //get the all comments
//     const trendId = req.params.trend_id;
//     const pageNo = req.params.pageNo;
//     const showData = 10;
//     const removeData = (pageNo - 1) * showData;
//     const sortData = { created_at: -1 };

//     const allComments = await Comment.aggregate([
//       {
//         $match: {
//           trend_id: ObjectId(trendId),
//           deleted: false,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "user_id",
//           foreignField: "_id",
//           pipeline: [
//             {
//               $match: {
//                 verified: true,
//                 deleted: false,
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 username: { $ifNull: [ "$username", "" ] },
//                 created_at: 1,
//                 email: 1,
//               },
//             },
//           ],
//           as: "commentedByUser",
//         },
//       },
//       {
//         $lookup: {
//           from: "admins",
//           localField: "user_id",
//           foreignField: "_id",
//           pipeline: [
//             {
//               $project: {
//                 _id: 1,
//                 "username": { $ifNull: [ "$user_name", "" ] },
//                 created_at: 1,
//                 email: 1,
//               },
//             },
//           ],
//           as: "commentedByAdmin",
//         }
//       },
//       {
//         $addFields : {
//           'commentedBy' :  {
//             if: { $gt:[{$size : '$commentedByAdmin'}, 0]},
//             then: "$commentedByAdmin",
//             else: "$commentedByUser"
//           }
//         }
//       },
//       // {
//       //   $unwind: {
//       //     path: "$commentedBy",
//       //     preserveNullAndEmptyArrays: true,
//       //   },
//       // },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "_id",
//           foreignField: "comment_id",
//           pipeline:[
//             {
//             $match:{
//                 user_id : new mongoose.Types.ObjectId(req.user.id),
//                 deleted: false,
//                 like_dislike: true,
//             }
//             }
//           ],
//           as: "alreadyLike_comment",
//         },
//       },
//       {
//         $addFields: {
//           alreadyLikeComment: {
//             $size: "$alreadyLike_comment",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "_id",
//           foreignField: "comment_id",
//           pipeline:[
//             {
//             $match:{
//                 user_id : new mongoose.Types.ObjectId(req.user.id),
//                 deleted: false,
//                 like_dislike: false,
//             }
//             }
//           ],
//           as: "alreadyDislike_comment",
//         },
//       },
//       {
//         $addFields: {
//           alreadyDislikeComment: {
//             $size: "$alreadyDislike_comment",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "_id",
//           foreignField: "comment_id",
//           pipeline: [
//             {
//               $match: {
//                 deleted: false,
//                 like_dislike: true,
//               },
//             },
//           ],
//           as: "totalLikes",
//         },
//       },
//       {
//         $addFields: {
//           totalNumberOflikes: {
//             $size: "$totalLikes",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "_id",
//           foreignField: "comment_id",
//           pipeline: [
//             {
//               $match: {
//                 deleted: false,
//                 like_dislike: false,
//               },
//             },
//           ],
//           as: "totalUnLikes",
//         },
//       },
//       {
//         $addFields: {
//           totalNumberOfDislikes: {
//             $size: "$totalUnLikes",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "replies",
//           localField: "_id",
//           foreignField: "comment_id",
//           pipeline: [
//             {
//               $match: {
//                 deleted: false,
//               },
//             }
//           ],
//           as: "replieData",
//         },
//       },
//       {
//         $unwind: {
//           path: "$replieData",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "replieData._id",
//           foreignField: "reply_id",
//           pipeline:[
//             {
//             $match:{
//                 user_id : new mongoose.Types.ObjectId(req.user.id),
//                 deleted: false,
//                 like_dislike: false,
//             }
//             }
//           ],
//           as: "alreadyDislike_reply",
//         },
//       },
//       {
//         $addFields: {
//           "replieData.alreadyDislikeReply": {
//             $size: "$alreadyDislike_reply",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "replieData._id",
//           foreignField: "reply_id",
//           pipeline:[
//             {
//             $match:{
//                 user_id : new mongoose.Types.ObjectId(req.user.id),
//                 deleted: false,
//                 like_dislike: true,
//             }
//             }
//           ],
//           as: "alreadylike_reply",
//         },
//       },
//       {
//         $addFields: {
//           "replieData.alreadylikeReply": {
//             $size: "$alreadylike_reply",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "replieData.reply_to",
//           foreignField: "_id",
//           pipeline: [
//             {
//               $match: {
//                 verified: true,
//                 deleted: false,
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 username: 1,
//                 created_at: 1,
//                 email: 1,
//               },
//             },
//           ],
//           as: "replieData.reply_to_detail",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "replieData.user_id",
//           foreignField: "_id",
//           pipeline: [
//             {
//               $match: {
//                 verified: true,
//                 deleted: false,
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 username: 1,
//                 created_at: 1,
//                 email: 1,
//               },
//             },
//           ],
//           as: "replieData.reply_by_detail",
//         },
//       },
//       {
//         $lookup: {
//           from: "admins",
//           localField: "replieData.user_id",
//           foreignField: "_id",
//           pipeline: [
//             {
//               $match: {
//                 deleted: false,
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 username: 1,
//                 created_at: 1,
//                 email: 1,
//               },
//             },
//           ],
//           as: "replieData.reply_by_detail",
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "replieData._id",
//           foreignField: "reply_id",
//           pipeline: [
//             {
//               $match: {
//                 deleted: false,
//                 like_dislike: true,
//               },
//             },
//           ],
//           as: "totalLikes_reply",
//         },
//       },
//       {
//         $addFields: {
//           'replieData.totalreplyLikes': {
//             $size: "$totalLikes_reply",
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "likecomments",
//           localField: "replieData._id",
//           foreignField: "reply_id",
//           pipeline: [
//             {
//               $match: {
//                 deleted: false,
//                 like_dislike: false,
//               },
//             },
//           ],
//           as: "totalUnLikes_reply",
//         },
//       },
//       {
//         $addFields: {
//           'replieData.totalreplyUnLikes': {
//             $size: "$totalUnLikes_reply",
//           },
//         },
//       },
//       {
//         $skip: removeData,
//       },
//       {
//         $limit: showData,
//       },
//       {
//         $group: {
//           _id : {
//             _id: "$_id",
//             trend_id: "$trend_id",
//             comment: "$comment",
//             totalNumberOflikes: "$totalNumberOflikes",
//             totalNumberOfDislikes: "$totalNumberOfDislikes",
//             commentedBy: "$commentedBy",
//             created_at : "$created_at"
//           },
//           allreplies: {
//             $push: "$replieData"
//           }
//           }
//       },
//       {
//         $project : {
//             _id : 1,
//             allreplies:
//             {
//               $let : {
//                 vars :{
//                   'checkReplytoDetailArr' : { $first:  '$allreplies.reply_to_detail' }
//                 },
//                 in:{
//                   $cond:
//                   {
//                     if: { $gt:[{$size : '$$checkReplytoDetailArr'}, 0]},
//                     then: "$allreplies",
//                     else: []
//                   }
//                 }
//               }
//             }
//         }
//       }
//     ]);

//     if (allComments.length == 0) {
//       return res.json({
//         success: true,
//         msg: "No data found!",
//         data: allComments,
//       });
//     }

//     //need to check again

//     return res.json({
//       success: true,
//       msg: "Data found successfully",
//       data: allComments,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send({
//       success: false,
//       errors: [
//         {
//           msg: "Server error",
//           param: "server",
//           location: "body",
//         },
//       ],
//     });
//   }
// });

//
// @route    Get api/admin/site_traffic_stats
// @desc     get the sidebar content
// @access   Private
router.get("/site_traffic_stats", auth, async (req, res) => {
  try {
    const data = await User.find(
      { deleted: 0 },
      {
        _id: 1,
      }
    );
    const categoryChartStats = await Categories.aggregate([
      {
        $lookup: {
          from: "trends",
          localField: "_id",
          foreignField: "category_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "totalTrends",
        },
      },
      {
        $addFields: {
          totalTrends: {
            $size: "$totalTrends",
          },
        },
      },
      {
        $project: {
          // name: {
          //   $ifNull: [
          //     {
          //       $concat: [
          //         "Total Trends till now",
          //         " - ",
          //         { $toString: "$totalTrends" },
          //       ],
          //     },
          //     "",
          //   ],
          // },
          //value: { $ifNull: ["$title", ""] },
          name: { $ifNull: ["$title", ""] },
          value: {
            $ifNull: [
              
                "$totalTrends" ,0
                ],
              },
          },
        },
    ]);

    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: {
        totalActiveUsers: data.length,
        subscriptionFreeUsers: data.length,
        paidSubscriptionUsers: 0,
        categoryChartStats,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.get("/site_per_category", auth, async (req, res) => {
  try {
    const categoryChartStats = await Categories.aggregate([
      {
        $group: {
          _id: null,
          items: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $project: {
          labels: { $ifNull: ["$items.title", ""] },
        },
      },
    ]);
    const categoryChartStatsValues = await Categories.aggregate([
      {
        $lookup: {
          from: "trends",
          localField: "_id",
          foreignField: "category_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "totalTrends",
        },
      },
      {
        $addFields: {
          totalTrends: {
            $size: "$totalTrends",
          },
        },
      },
      {
        $group: {
          _id: null,
          items: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $project: {
          data: { $ifNull: ["$items.totalTrends", 0] },
        },
      },
    ]);
    var result = {
      labels: [],
      data: [],
    };
    if (categoryChartStats.length > 0 && categoryChartStatsValues.length > 0) {
      result = {
        labels: categoryChartStats[0].labels,
        data: categoryChartStatsValues[0].data,
      };
    }
    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: result,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});

router.get("/get_trends_sorted_list", 
//auth,
 async (req, res) => {
  const showData = 10;
  try {
    var search = { publication_status: true, deleted: false };
    var sortBy = { views_count_start_from: -1 };
    var { sort_type } = req.query;
    if(sort_type && sort_type == 1){
      sortBy = { views_count_start_from: -1 };
    }else if(sort_type && sort_type == 2){
      sortBy = { liketrendCount: -1 };
    }else if(sort_type && sort_type == 3){
      sortBy = { saveToCollectionCount: -1 };
    }
    var data = await Trends.aggregate([
      {
        $match: search,
      },
      {
        $lookup: {
          from: "tags",
          foreignField: "_id",
          localField: "focus_tags_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                tag_name: 1,
              },
            },
          ],
          as: "focus_tags_ids",
        },
      },
      {
        $lookup: {
          from: "admins",
          foreignField: "_id",
          localField: "author",
          pipeline: [
            {
              $project: {
                _id: 1,
                first_name: { $ifNull: ["$first_name", ""] },
                profile_image: { $ifNull: ["$profile_image", ""] },
              },
            },
          ],
          as: "author",
        },
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "liketrends",
          foreignField: "trend_id",
          localField: "_id",
          pipeline: [
            {
              $match: {
                like_dislike: true,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "liketrends",
        },
      },
      {
        $lookup: {
          from: "savetocollections",
          foreignField: "trend_id",
          localField: "_id",
          pipeline: [
            {
              $match: {
                deleted: false,
              },
            },
            {
              $project: {
                trend_id: 1,
              },
            },
          ],
          as: "saveToCollections",
        },
      },
      {
        $addFields: {
          liketrendCount: {
            $size: "$liketrends",
          },
        },
      },
      {
        $addFields: {
          saveToCollectionCount: {
            $size: "$saveToCollections",
          },
        },
      },
      { $sort : sortBy},
      { $limit : showData},
      {
        $project: {
          title: 1,
          saveToCollectionCount: 1,
          views_count_start_from:  { $ifNull: ["$views_count_start_from", 0] },
          liketrendCount: 1,
        },
      },
    ]);
    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: data,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({
      success: false,
      errors: [
        {
          msg: "Server error",
          param: "server",
          location: "body",
        },
      ],
    });
  }
});
module.exports = router;
