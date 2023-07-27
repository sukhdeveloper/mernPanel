const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Categories = require("../../models/Categories");
const Subcategories = require("../../models/Subcategories");
const Dropdown = require("../../models/Dropdown");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);
const config = require("config");
const jwt = require("jsonwebtoken");
const Tags = require("../../models/Tags");
const OtpTokens = require("../../models/FrontendTokens");
const User = require("../../models/User");
const Trends = require("../../models/Trends");
const sendGridAPiKey = process.env.SENDGRID_KEY;
const fromEmail = process.env.FROM_EMAIL;
const forgotPasswordTemplateId = process.env.FORGOTPASSWORD_TEMPLATEID;
const mern2WarriorAccountVerification =
  process.env.mern2_WARRIOR_ACCOUNT_VERIFICATION;
const verifyUserTemplateId = process.env.VERIFYUSER_TEMPLATEID;
const mern2WarriorAccountVerificationForAdmin =
  process.env.mern2_WARRIOR_ACCOUNT_VERIFICATION_FOR_ADMIN;
const sgMail = require("@sendgrid/mail");
const Comment = require("../../models/Comments");
const Reply = require("../../models/Reply");
const LikeTrend = require("../../models/LikeTrend");
const LikeComments = require("../../models/LikeComments");
const SaveToCollection = require("../../models/SaveToCollection");
const Admin = require("../../models/Admin");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const multer = require("multer");
const { findOneAndRemove, findOneAndUpdate } = require("../../models/Admin");
const FrontendTokens = require("../../models/FrontendTokens");
const PortalSettings = require("../../models/PortalSettings");
const RecentHistory = require("../../models/RecentHistory");

const axios = require("axios");
const PageHistory = require("../../models/UserHistory");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname);
  },
});

function diff_minutes(dt2, dt1) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  // console.log("time", dt2.getTime() , dt1.getTime() )

  diff /= 60;
  return Math.round(diff);
}

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.get("/get_categories_subcategories", async (req, res) => {
  try {
    const { category_id, _id } = req.query;
    var isSubcategory = false;
    var search = {
      deleted: false,
    };
    var data = [];
    if (category_id) {
      isSubcategory = true;
      search["category_id"] = category_id;
    }
    if (_id) {
      search["_id"] = _id;
    }
    if (isSubcategory) {
      if (search._id) {
        data = await Subcategories.findOne(search).populate("category_id");
      } else {
        data = await Subcategories.find(search).populate("category_id");
      }
    } else {
      if (search._id) {
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

router.get("/get_selected_categories_subcategories", async (req, res) => {
  try {
    const { category_ids } = req.query;
    var categories = JSON.parse(category_ids);
    var selectedCategories = [];
    categories.map(async (id) => {
      selectedCategories.push(ObjectId(id));
      return ObjectId(id);
    });
    var data = await Subcategories.find({
      publication_status: true,
      category_id: selectedCategories,
    });

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
      message: "Record fetched successfully.",
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

router.get("/get_trends", async (req, res) => {
  const { _id, category_id, slug, search_keyword, featured, compass_matrics } =
    req.query;
  try {
    var categoriesIds = [];

    var search = { publication_status: true, deleted: false };
    if (category_id) {
      category_id.map((ids) => {
        categoriesIds.push(ObjectId(ids));
      });
      search.category_ids = { $in: categoriesIds };
    }
    if (_id) {
      search._id = ObjectId(_id);
    }
    if (slug) {
      search.slug = slug;
    }
    if (featured) {
      search.featured = true;
    }
    if (compass_matrics && compass_matrics != "") {
      var dropdownData = await Dropdown.findOne({ name: "mern2_compass" });
      var allOptions = dropdownData.options;
      const updated_compass_matrics = compass_matrics.charAt(0).toUpperCase() + compass_matrics.slice(1);
      var valueOfDropdown = allOptions.indexOf(updated_compass_matrics);
      if(valueOfDropdown){
        search.mern2_compass = { $in: [valueOfDropdown] };
      }

    }
    if (search_keyword) {
      // var searchTrends = [];
      // var finelids = [];
      // var trendsTitle = await Trends.find(
      //   { title: { $regex: search_keyword, $options: "i" } },
      //   { _id: 1, title: 1, category_ids: 1 }
      // );
      // var categoryTitle = await Categories.find(
      //   { title: { $regex: search_keyword, $options: "i" } },
      //   { _id: 1, title: 1 }
      // );
      // var subcategoryTitle = await Subcategories.find(
      //   { title: { $regex: search_keyword, $options: "i" } },
      //   { _id: 1, title: 1, category_id: 1 }
      // );
      // categoryTitle.map((data, index) => {
      //   searchTrends.push(data._id.toString());
      // });
      // subcategoryTitle.map((data, index) => {
      //   searchTrends.push(data.category_id.toString());
      // });
      // var uniqueChars = [...new Set(searchTrends)];
      // uniqueChars.map((ids) => {
      //   finelids.push(ObjectId(ids));
      // });
      search.title = { $regex: search_keyword, $options: "i" };
      // if(finelids.length > 0){
      //   search.category_ids  =  {$in: finelids};
      // }
    }

    console.log(search);

    var data = await Trends.aggregate([
      {
        $match: search,
      },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          localField: "category_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "category_ids",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          foreignField: "_id",
          localField: "subcategory_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "subcategory_ids",
        },
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
          from: "liketrends",
          foreignField: "trend_id",
          localField: "_id",
          pipeline: [
            {
              $match: {
                like_dislike: false,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "disliketrends",
        },
      },
      {
        $project: {
          title: 1,
          featured_images: 1,
          slug: 1,
          score: 1,
          gender: 1,
          publication_status: { $ifNull: ["$publication_status", false] },
          comment_status: 1,
          category_ids: 1,
          subcategory_ids: 1,
          tags_ids: 1,
          focus_tags_ids: 1,
          sub_heading: 1,
          summary: 1,
          review_summary: 1,
          reference_links: 1,
          featured_images: 1,
          video_link: 1,
          read_time: 1,
          seo: 1,
          popularity: 1,
          inventiveness: 1,
          engagement: 1,
          human_centricity: 1,
          score: 1,
          age_group: 1,
          geography: 1,
          mern2_compass: 1,
          format: 1,
          author: 1,
          preview_image: 1,
          author_type: 1,
          publication_status: 1,
          comment_status: 1,
          deleted: 1,
          created_at: 1,
          views_count_start_from: { $ifNull: ["$views_count_start_from", 0] },
          liketrends: { $size: "$liketrends" },
          disliketrends: { $size: "$disliketrends" },
        },
      },
    ]);

    if (slug && data.length > 0) {
      var updatedViewCount = Number(data[0].views_count_start_from) + Number(1);
      await Trends.findOneAndUpdate(
        {
          _id: data[0]._id,
        },
        {
          $set: {
            views_count_start_from: updatedViewCount,
          },
        }
      );
    }

    var returnData = data.length == 1 && (_id || slug) ? data[0] : data;
    res.json({
      success: true,
      msg: "Record fetched successfully.",
      data: returnData,
      search
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

router.get("/get_trends_ids_info", async (req, res) => {
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

// @route    POST api/users/signUp
// @desc     SignUp user with token
// @access   Public
router.post(
  "/sign_up",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please enter valid email").matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
    check(
      "password",
      "Please enter a strong password with 6 or more that contain atleast 1 Capital, 1 small letter, 1 number and 1 special character."
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/),
    check(
      "confirm_password",
      "Confirm password must be strong and matched with password."
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, username, phone, password, confirm_password } = req.body;

    try {
      //check for same password
      if (password !== confirm_password) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Your Password is not mathed with confirm password",
            },
          ],
        });
      }

      var phoneno = /^\d{10}$/;
      if (phone && !phone.match(phoneno)) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Phone number must be in 10 digits.",
            },
          ],
        });
      }

      //check for user already exsist
      const checkUser = await User.findOne({ email: email, verified: true });
      const checkUserbyPhone = await User.findOne({
        phone: { $exists: true },
        phone: phone,
        verified: true,
      });

      if (checkUserbyPhone && checkUserbyPhone.phone !== undefined) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Phone no. already in use",
            },
          ],
        });
      }
      if (checkUser) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Email already in use",
            },
          ],
        });
      } else {
        const event = new Date();
        event.setMinutes(event.getMinutes() + 5);
        // console.log(event.getTime());
        var RendomNumberCode = Math.floor(100000 + Math.random() * 900000);
        const SaveUserData = {
          email: email,
          password: await bcrypt.hash(password, salt),
          verification_code: RendomNumberCode,
          verification_code_expire: event,
          username: username,
          phone: phone,
        };

        var saveNewUser = await User.findOneAndUpdate(
          { email: email },
          { $set: SaveUserData },
          { new: true, upsert: true }
        );
        var userVerificationLink =
          process.env.VERIFICATION_URL +
          "verify-account/" +
          saveNewUser._id +
          "-" +
          saveNewUser.verification_code;
        sgMail.setApiKey(sendGridAPiKey);
        const msg = {
          to: email,
          from: fromEmail,
          templateId: verifyUserTemplateId,
          dynamicTemplateData: {
            subject: "User Verification",
            username: username,
            auto_verify_link: userVerificationLink,
          },
        };
        sgMail.send(msg, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log(saveNewUser._id);
            const payload = {
              user: {
                id: saveNewUser._id,
              },
            };

            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: 864000 }, // 10 days expire
              (err, token) => {
                if (err) throw err;
                return res.json({
                  success: true,
                  msg: "Please check your email , Verify your account",
                  token: token,
                  data: saveNewUser,
                });
              }
            );
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

// @route    POST api/users/sign_in
// @desc     sign_in user with token
// @access   Public
router.post(
  "/sign_in",
  [
    check("email", "Please enter valid email").matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
    check(
      "password",
      "Please enter a strong password with 6 or more that contain atleast 1 Capital, 1 small letter, 1 number and 1 special character."
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      var role = 0;
      let user = await User.findOne({ email: email });
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

      if (user && user.verified == false) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Your account is not verified yet. Please verify it first",
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

      console.log(user.id);

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
            data: token,
            userId: user.id,
          });
        }
      );
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

// @route    GET api/users/sign_in
// @desc     sign_in user with token
// @access   Public
router.get("/sign_in", auth, async (req, res) => {
  try {
    var role = 0;
    let user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            response: "error",
            param: "email",
            msg: "Something went wrong",
          },
        ],
      });
    }
    if (user && user.verified == false) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Your account is not verified yet. Please verify it first",
          },
        ],
      });
    }
    res.json({
      success: true,
      response: "successful",
      msg: "Record fetched successfully.",
      data: user,
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

// @route    POST api/users/signUp_mern2_warrior
// @desc      signUp_mern2_warrior with token
// @access   Public
router.post(
  "/signUp_mern2_warrior",
  [
    check("email", "Please enter valid email").matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
    check("user_name", "Please enter the username ").not().isEmpty(),
    check("profile_description", "Please enter the profile description")
      .not()
      .isEmpty(),
    check("profile_image", "Please enter the profile image").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const userRole = 1; // mern2 warrior user Role
    const {
      email,
      user_name,
      first_name,
      profile_image,
      last_name,
      profile_description,
      phone,
    } = req.body;

    try {
      //check for user already exsist
      const checkUserAdminCollection = await Admin.findOne({
        email: email,
        verified: true,
      });
      const checkUserInUserCollection = await User.findOne({
        email: email,
        verified: true,
      });
      if (checkUserAdminCollection || checkUserInUserCollection) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Email already in use",
            },
          ],
        });
      } else {
        var RendomNumberCode = Math.floor(100000 + Math.random() * 900000);
        var getAllAdminEmails = await PortalSettings.findOne(
          {},
          { email_addresses_to_get_notifications: 1 }
        );
        var userVerificationLink =
          "One new warrior req is registered. please approve";
        const SaveUserData = {
          email: email,
          profile_image: profile_image,
          verification_code: RendomNumberCode,
          user_role: userRole,
          user_name: user_name,
          first_name: first_name,
          last_name: last_name,
          profile_description: profile_description,
          phone: phone,
          account_status: false,
        };

        var saveNewUser = await Admin.findOneAndUpdate(
          { email: email },
          { $set: SaveUserData },
          {
            new: true,
            upsert: true,
          }
        );

        sgMail.setApiKey(sendGridAPiKey);
        const msg = {
          to: email,
          from: fromEmail,
          templateId: mern2WarriorAccountVerification,
          dynamicTemplateData: {
            username: first_name,
          },
        };
        console.log(getAllAdminEmails.email_addresses_to_get_notifications);
        const adminMsg = {
          to: getAllAdminEmails.email_addresses_to_get_notifications,
          from: fromEmail,
          templateId: mern2WarriorAccountVerificationForAdmin,
          dynamicTemplateData: {
            username: first_name,
            user_email: email,
          },
        };
        sgMail.send(msg, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log(saveNewUser._id);
            sgMail.send(adminMsg, (err, resultOfEmail) => {
              if (err) {
                console.log(err);
              }
            });
            const payload = {
              user: {
                id: saveNewUser._id,
              },
            };

            jwt.sign(
              payload,
              config.get("jwtSecret"),
              { expiresIn: 864000 }, // 10 days expire
              (err, token) => {
                if (err) throw err;
                return res.json({
                  success: true,
                  msg: "You request is in under review. Keep checking your email for further infomation.",
                  token: token,
                  data: saveNewUser,
                });
              }
            );
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

// @route    POST api/users/resend_account_verificationLink
// @desc     SignUp for resend the verification link
// @access   Public -- link and the otp of the link is always same
router.post(
  "/resend_account_verification_link",
  [
    check("email", "Please enter valid email").matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    try {
      //check for user already exsist
      const checkUser = await User.findOne({ email: email });
      const event = new Date();
      event.setMinutes(event.getMinutes() + 5);
      var RendomNumberCode = Math.floor(100000 + Math.random() * 900000);
      // console.log(event.getTime());
      const SaveUserData = {
        verification_code: RendomNumberCode,
        verification_code_expire: event,
      };
      var saveNewUser = await User.findOneAndUpdate(
        { email: email },
        { $set: SaveUserData },
        { new: true, upsert: true }
      );

      if (checkUser) {
        let userVerificationLink =
          process.env.VERIFICATION_URL +
          "verify-account/" +
          saveNewUser._id +
          "-" +
          saveNewUser.verification_code;
        sgMail.setApiKey(sendGridAPiKey);
        const msg = {
          to: email,
          from: fromEmail,
          templateId: verifyUserTemplateId,
          dynamicTemplateData: {
            subject: "User Verification",
            username: checkUser.username,
            auto_verify_link: userVerificationLink,
          },
        };
        sgMail.send(msg, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            return res.status(200).json({
              success: true,
              msg: "Link resend successfully",
            });
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Email is not exist",
            },
          ],
        });
      }
      //send the email here
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

// @route    put api/users/verify_account
// @desc     SignUp verify user account by link
// @access   Public -- verify user account by user link
router.put(
  "/verify_account",
  [check("verify_link", "Please enter valid verify link").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { verify_link } = req.body;
      const myArray = verify_link.split("-");
      const userId = myArray[0];
      const otp = myArray[1];
      const currentDateTimeString = new Date();
      const checkUser = await User.findOne({ _id: userId });
      var diff = diff_minutes(
        checkUser.verification_code_expire,
        currentDateTimeString
      );
      // console.log(diff)

      if (diff < 0) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Your verification link is expired.",
            },
          ],
        });
      }

      if (checkUser && checkUser.verified == true) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Account already verified",
            },
          ],
        });
      }
      //check for user already exists
      const verifyAccount = await User.findOneAndUpdate(
        { _id: userId, verification_code: otp },
        {
          $set: {
            verification_code: null,
            verified: true,
            account_status: true,
          },
        },
        {
          new: true,
        }
      );

      if (verifyAccount && verifyAccount.verified == true) {
        return res.status(200).json({
          success: true,
          msg: "Account verified successfully.",
          data: verifyAccount,
        });
      } else {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Invalid link.",
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

// @route    Po st api/users/comment
// @desc     SignUp for comments on the trends
// @access   Public -- \for add the comments
router.post(
  "/comment",
  [
    check("comment", "Comment is required").not().isEmpty(),
    check("trend_id", "Trend id is required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { trend_id, comment } = req.body;

    try {
      const SaveComment = new Comment({
        trend_id: trend_id,
        user_id: req.user.id,
        comment: comment,
      });

      const saveComment = await SaveComment.save();

      res.json({
        success: true,
        msg: "Your comment was submitted.",
        data: saveComment,
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

// @route    Post api/users/reply_on_comment
// @desc     SignUp for comments on the trends
// @access   Public -- \for add the comments
router.post(
  "/reply_on_comment",
  [
    check("reply", "Reply is required").not().isEmpty(),
    check("reply_to", "Reply to id is required").not().isEmpty(),
    check("trend_id", "Trend id is required").not().isEmpty(),
    check("comment_id", "Comment id is required").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { trend_id, user_id, comment_id, reply_to, reply } = req.body;

    try {
      const SaveReply = new Reply({
        trend_id: trend_id,
        user_id: req.user.id,
        comment_id: comment_id,
        reply_to: reply_to,
        reply: reply,
      });
      // return console.log("user ids " , reply_to.toString() , req.user.id.toString())
      const saveReply = await SaveReply.save();
      res.json({
        success: true,
        msg: "Reply Successfully",
        data: saveReply,
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

// @route    Post api/users/like_trend
// @desc     SignUp for comments on the trends
// @access   Public -- \for add the comments
router.post(
  "/like_trend",
  [check("trend_id", "Trend id is required").not().isEmpty()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { trend_id } = req.body;

    try {
      var saveData = new LikeTrend({
        trend_id: trend_id,
        user_id: req.user.id,
        like_dislike: true,
      });

      const likeStatus = await LikeTrend.findOne({
        user_id: req.user.id,
        trend_id: trend_id,
      });
      if (likeStatus && likeStatus.like_dislike == true) {
        const removedData = await LikeTrend.remove({ _id: likeStatus._id });
        if (removedData) {
          return res.json({
            success: true,
            msg: "Your like is removed !",
          });
        }
      } else {
        if (likeStatus) {
          const removedData = await LikeTrend.remove({ _id: likeStatus._id });
        }
        const saveLike = await saveData.save();
        if (saveLike) {
          return res.json({
            success: true,
            msg: "Your like is added.",
          });
        }
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

// @route    Post api/users/dislike_trend
// @desc     SignUp for comments on the trends
// @access   Public -- \for add the comments
router.post(
  "/dislike_trend",
  [check("trend_id", "Trend id is required").not().isEmpty()],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { trend_id } = req.body;

    try {
      var saveData = new LikeTrend({
        trend_id: trend_id,
        user_id: req.user.id,
        like_dislike: false,
      });

      const likeStatus = await LikeTrend.findOne({
        user_id: req.user.id,
        trend_id: trend_id,
      });

      if (likeStatus && likeStatus.like_dislike == 0) {
        const removedData = await LikeTrend.remove({ _id: likeStatus._id });
        if (removedData) {
          return res.json({
            success: true,
            msg: "Your dislike is removed !",
          });
        }
      } else {
        if (likeStatus) {
          const removedData = await LikeTrend.remove({ _id: likeStatus._id });
        }
        const saveLike = await saveData.save();
        if (saveLike) {
          return res.json({
            success: true,
            msg: "Your dislike is added.",
          });
        }
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

// @route    Post api/users/like_comment_reply
// @desc     SignUp for comments on the commmnts_reply
// @access   Public -- \for add the comments
router.post(
  "/like_comment_reply",
  [
    check("trend_id", "Trend id is required").not().isEmpty(),
    check("comment_reply_id", "comment and reply is required").not().isEmpty(),
    check(
      "comment_reply_Status",
      "comment and reply status is required and must be 0 or 1 only"
    ).isBoolean(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      trend_id,
      comment_reply_id,
      comment_reply_Status, // is status to recognize the "comment_reply_id"  is for replie == 0 or comment == 1
    } = req.body;

    try {
      //check user already like this
      var checkDataId;
      var setData;
      if (comment_reply_Status == 1) {
        checkDataId = {
          trend_id: trend_id,
          comment_id: comment_reply_id,
          user_id: req.user.id,
        };

        setData = new LikeComments({
          trend_id: trend_id,
          comment_id: comment_reply_id,
          user_id: req.user.id,
          like_dislike: 1,
        });
      } else if (comment_reply_Status == 0) {
        checkDataId = {
          trend_id: trend_id,
          reply_id: comment_reply_id,
          user_id: req.user.id,
        };

        setData = new LikeComments({
          trend_id: trend_id,
          reply_id: comment_reply_id,
          user_id: req.user.id,
          like_dislike: 1,
        });
      }

      const likeStatus = await LikeComments.findOne(checkDataId);

      if (likeStatus && likeStatus.like_dislike == 1) {
        const removedData = await LikeComments.remove({ _id: likeStatus._id });
        if (removedData) {
          return res.json({
            success: true,
            msg: "Your like is removed !",
          });
        }
      } else {
        if (likeStatus) {
          const removedData = await LikeComments.remove({
            _id: likeStatus._id,
          });
        }
        const saveLike = await setData.save();
        if (saveLike) {
          return res.json({
            success: true,
            msg: "Your like is added.",
          });
        }
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

// @route    Post api/users/dislike_comment_reply
// @desc     SignUp for comments on the commmnts_reply
// @access   Public -- \for add the comments
router.post(
  "/dislike_comment_reply",
  [
    check("trend_id", "Trend id is required").not().isEmpty(),
    check("comment_reply_id", "comment and reply is required").not().isEmpty(),
    check(
      "comment_reply_Status",
      "comment and reply status is required and must be 0 or 1 only"
    ).isBoolean(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      trend_id,
      comment_reply_id,
      comment_reply_Status, // is status to recognize the "comment_reply_id"  is for replie == 0 or comment == 1
    } = req.body;

    try {
      //check user already like this
      var checkDataId;
      var setData;
      if (comment_reply_Status == 1) {
        checkDataId = {
          trend_id: trend_id,
          comment_id: comment_reply_id,
          user_id: req.user.id,
        };

        setData = new LikeComments({
          trend_id: trend_id,
          comment_id: comment_reply_id,
          user_id: req.user.id,
          like_dislike: 0,
        });
      } else if (comment_reply_Status == 0) {
        checkDataId = {
          trend_id: trend_id,
          reply_id: comment_reply_id,
          user_id: req.user.id,
        };

        setData = new LikeComments({
          trend_id: trend_id,
          reply_id: comment_reply_id,
          user_id: req.user.id,
          like_dislike: 0,
        });
      }

      const likeStatus = await LikeComments.findOne(checkDataId);

      if (likeStatus && likeStatus.like_dislike == 0) {
        const removedData = await LikeComments.remove({ _id: likeStatus._id });
        if (removedData) {
          return res.json({
            success: true,
            msg: "Your dislike is removed !",
          });
        }
      } else {
        if (likeStatus) {
          const removedData = await LikeComments.remove({
            _id: likeStatus._id,
          });
        }
        const saveLike = await setData.save();
        if (saveLike) {
          return res.json({
            success: true,
            msg: "Your dislike is added.",
          });
        }
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

// @route    Get api/users/all_comments/:trend_id/:pageNo
// @desc     Get all comments
// @access   Public -- \for get the all commentes
router.get("/all_comments/:trend_id/:pageNo", async (req, res) => {
  try {
    //get the all comments
    const trendId = req.params.trend_id;
    const pageNo = req.params.pageNo;
    const showData = 10;
    const removeData = (pageNo - 1) * showData;
    const sortData = { created_at: -1 };

    const allComments = await Comment.aggregate([
      {
        $match: {
          trend_id: ObjectId(trendId),
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                verified: true,
                deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                created_at: 1,
                email: 1,
              },
            },
          ],
          as: "commentedBy",
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "totalLikes",
        },
      },
      {
        $addFields: {
          totalNumberOflikes: {
            $size: "$totalLikes",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: false,
              },
            },
          ],
          as: "totalUnLikes",
        },
      },
      {
        $addFields: {
          totalNumberOfDislikes: {
            $size: "$totalUnLikes",
          },
        },
      },
      {
        $unwind: {
          path: "$commentedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "replies",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                deleted: false,
              },
            },
          ],
          as: "replieData",
        },
      },
      {
        $unwind: {
          path: "$replieData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "replieData.reply_to",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                verified: true,
                deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                created_at: 1,
                email: 1,
              },
            },
          ],
          as: "replieData.reply_to_detail",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "replieData.user_id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                verified: true,
                deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                created_at: 1,
                email: 1,
              },
            },
          ],
          as: "replieData.reply_by_detail",
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "replieData._id",
          foreignField: "reply_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "totalLikes_reply",
        },
      },
      {
        $addFields: {
          "replieData.totalreplyLikes": {
            $size: "$totalLikes_reply",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "replieData._id",
          foreignField: "reply_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: false,
              },
            },
          ],
          as: "totalUnLikes_reply",
        },
      },
      {
        $addFields: {
          "replieData.totalreplyUnLikes": {
            $size: "$totalUnLikes_reply",
          },
        },
      },
      // {
      //   $skip: removeData,
      // },
      // {
      //   $limit: showData,
      // },
      {
        $group: {
          _id: {
            _id: "$_id",
            trend_id: "$trend_id",
            comment: "$comment",
            totalNumberOflikes: "$totalNumberOflikes",
            totalNumberOfDislikes: "$totalNumberOfDislikes",
            commentedBy: "$commentedBy",
            created_at: "$created_at",
          },
          allreplies: {
            $push: "$replieData",
          },
        },
      },
      {
        $project: {
          _id: 1,
          allreplies: {
            $let: {
              vars: {
                checkReplytoDetailArr: {
                  $first: "$allreplies.reply_to_detail",
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: "$$checkReplytoDetailArr" }, 0] },
                  then: "$allreplies",
                  else: [],
                },
              },
            },
          },
        },
      },
    ]);

    if (allComments.length == 0) {
      return res.json({
        success: true,
        msg: "No data found",
        data: allComments,
      });
    }

    //need to check again

    return res.json({
      success: true,
      msg: "Data found successfully",
      data: allComments,
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

// @route    Get api/users/all_comments/:trend_id/:pageNo --- with auth
// @desc     Get all comments
// @access   Public -- \for get the all commentes
router.get("/all_comments_auth/:trend_id/:pageNo", auth, async (req, res) => {
  try {
    //get the all comments
    const trendId = req.params.trend_id;
    const pageNo = req.params.pageNo;
    const showData = 10;
    const removeData = (pageNo - 1) * showData;
    const sortData = { created_at: -1 };

    const allComments = await Comment.aggregate([
      {
        $match: {
          trend_id: ObjectId(trendId),
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                verified: true,
                deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                created_at: 1,
                email: 1,
              },
            },
          ],
          as: "commentedBy",
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                user_id: new mongoose.Types.ObjectId(req.user.id),
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "alreadyLike_comment",
        },
      },
      {
        $addFields: {
          alreadyLikeComment: {
            $size: "$alreadyLike_comment",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                user_id: new mongoose.Types.ObjectId(req.user.id),
                deleted: false,
                like_dislike: false,
              },
            },
          ],
          as: "alreadyDislike_comment",
        },
      },
      {
        $addFields: {
          alreadyDislikeComment: {
            $size: "$alreadyDislike_comment",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "totalLikes",
        },
      },
      {
        $addFields: {
          totalNumberOflikes: {
            $size: "$totalLikes",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: false,
              },
            },
          ],
          as: "totalUnLikes",
        },
      },
      {
        $addFields: {
          totalNumberOfDislikes: {
            $size: "$totalUnLikes",
          },
        },
      },
      {
        $unwind: {
          path: "$commentedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "replies",
          localField: "_id",
          foreignField: "comment_id",
          pipeline: [
            {
              $match: {
                deleted: false,
              },
            },
          ],
          as: "replieData",
        },
      },
      {
        $unwind: {
          path: "$replieData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "replieData._id",
          foreignField: "reply_id",
          pipeline: [
            {
              $match: {
                user_id: new mongoose.Types.ObjectId(req.user.id),
                deleted: false,
                like_dislike: false,
              },
            },
          ],
          as: "alreadyDislike_reply",
        },
      },
      {
        $addFields: {
          "replieData.alreadyDislikeReply": {
            $size: "$alreadyDislike_reply",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "replieData._id",
          foreignField: "reply_id",
          pipeline: [
            {
              $match: {
                user_id: new mongoose.Types.ObjectId(req.user.id),
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "alreadylike_reply",
        },
      },
      {
        $addFields: {
          "replieData.alreadylikeReply": {
            $size: "$alreadylike_reply",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "replieData.reply_to",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                verified: true,
                deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                created_at: 1,
                email: 1,
              },
            },
          ],
          as: "replieData.reply_to_detail",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "replieData.user_id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                verified: true,
                deleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                created_at: 1,
                email: 1,
              },
            },
          ],
          as: "replieData.reply_by_detail",
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "replieData._id",
          foreignField: "reply_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: true,
              },
            },
          ],
          as: "totalLikes_reply",
        },
      },
      {
        $addFields: {
          "replieData.totalreplyLikes": {
            $size: "$totalLikes_reply",
          },
        },
      },
      {
        $lookup: {
          from: "likecomments",
          localField: "replieData._id",
          foreignField: "reply_id",
          pipeline: [
            {
              $match: {
                deleted: false,
                like_dislike: false,
              },
            },
          ],
          as: "totalUnLikes_reply",
        },
      },
      {
        $addFields: {
          "replieData.totalreplyUnLikes": {
            $size: "$totalUnLikes_reply",
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
        $group: {
          _id: {
            _id: "$_id",
            trend_id: "$trend_id",
            comment: "$comment",
            totalNumberOflikes: "$totalNumberOflikes",
            totalNumberOfDislikes: "$totalNumberOfDislikes",
            commentedBy: "$commentedBy",
            created_at: "$created_at",
          },
          allreplies: {
            $push: "$replieData",
          },
        },
      },
      {
        $project: {
          _id: 1,
          allreplies: {
            $let: {
              vars: {
                checkReplytoDetailArr: {
                  $first: "$allreplies.reply_to_detail",
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: "$$checkReplytoDetailArr" }, 0] },
                  then: "$allreplies",
                  else: [],
                },
              },
            },
          },
        },
      },
    ]);

    if (allComments.length == 0) {
      return res.json({
        success: true,
        msg: "No data found",
        data: allComments,
      });
    }

    //need to check again

    return res.json({
      success: true,
      msg: "Data found successfully",
      data: allComments,
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

// @route    Post api/users/save_to_collection
// @desc     for save the trends in collection
// @access   Private
router.post(
  "/save_to_collection",
  auth,
  [check("trend_id", "Trend id is required").not().isEmpty()],
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
      const { trend_id } = req.body;

      const saveData = {
        trend_id: trend_id,
        user_id: userId,
      };
      const checkAlreadyHaveorNot = await SaveToCollection.findOneAndDelete(
        saveData
      );
      if (checkAlreadyHaveorNot) {
        return res.status(200).json({
          success: true,
          msg: "Trend removed from collection",
        });
      }

      const saveTocollection = await SaveToCollection.findOneAndUpdate(
        saveData,
        {
          $set: saveData,
        },
        {
          new: true,
          upsert: true,
        }
      );

      if (saveTocollection) {
        return res.json({
          success: true,
          msg: "Trend saved in collection",
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

// @route    Get api/users/single_trend_savecollection_status
// @desc     to get the single post save into collection status
// @access   Private
router.get(
  "/single_trend_savecollection_status/:trend_id",
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
      const trendId = req.params.trend_id;

      const saveTocollection = await SaveToCollection.findOne({
        user_id: userId,
        trend_id: trendId,
      });
      if (saveTocollection) {
        return res.json({
          success: true,
          msg: "Data found successfully",
        });
      } else {
        return res.json({
          success: false,
          msg: "Data not found",
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

// @route    Get api/users/activity_on_trends
// @desc      Check the activity on trend
// @access   Private
router.get("/activity_on_trends/:trend_id", async (req, res) => {
  try {
    const userId = req.query.user_id;
    const trendId = req.params.trend_id;
    //check save into colleciton
    var searchObj = {};
    searchObj.trend_id = trendId;
    var saveTocollection = null;
    var alreadyLIked = null;
    var alreadyUnliked = null;
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      searchObj.user_id = userId;
      saveTocollection = await SaveToCollection.findOne(searchObj, {
        _id: 1,
      });
      //check already like
      searchObj.like_dislike = 1;
      alreadyLIked = await LikeTrend.findOne(searchObj, { _id: 1 });
      //already unlike
      searchObj.like_dislike = 0;

      alreadyUnliked = await LikeTrend.findOne(searchObj, { _id: 1 });
    }
    //count of comments
    const countComments = await Comment.count({ trend_id: trendId });
    const countReplies = await Reply.count({ trend_id: trendId });
    //count of total likes and unlikes
    const countLikes = await LikeTrend.count({
      trend_id: trendId,
      like_dislike: true,
    });
    const countUnlikes = await LikeTrend.count({
      trend_id: trendId,
      like_dislike: false,
    });

    return res.json({
      success: true,
      msg: "Data found successfully",
      data: {
        saveTocollection: saveTocollection ? true : false,
        like: alreadyLIked ? true : false,
        unlike: alreadyUnliked ? true : false,
        totalComments: countComments + countReplies,
        totalLikes: countLikes,
        totalUnlikes: countUnlikes,
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

// @route    Put api/users/edit_comment
// @desc     Check the activity on trend
// @access   Private
router.put("/edit_comment", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment_id, comment } = req.body;
    console.log(req.user.id);
    //get the previous comment
    const lastComment = await Comment.findOne({
      _id: comment_id,
      user_id: userId,
    });
    if (!lastComment) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Comment not found!",
          },
        ],
      });
    }
    lastComment.history.push({ lastcomment: lastComment.comment });

    const UpdateComment = {
      comment: comment,
      history: lastComment.history,
    };

    const updateData = await Comment.findOneAndUpdate(
      { _id: comment_id },
      { $set: UpdateComment }
    );
    res.json({
      success: true,
      msg: "Comment is updated.",
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

// @route    Put api/users/edit_reply
// @desc     Check the activity on trend
// @access   Private
router.put("/edit_reply", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { reply_id, reply } = req.body;
    //get the previous reply
    const lastreply = await Reply.findOne({ _id: reply_id, user_id: userId });
    if (!lastreply) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "reply not found!",
          },
        ],
      });
    }
    lastreply.history.push({ lastreply: lastreply.reply });

    const Updatereply = {
      reply: reply,
      history: lastreply.history,
    };

    const updateData = await Reply.findOneAndUpdate(
      { _id: reply_id },
      { $set: Updatereply }
    );
    res.json({
      success: true,
      msg: "Reply is updated.",
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

//deleteComment
router.delete("/delete_comment_reply/:id/:type", auth, async (req, res) => {
  try {
    const reply_comment_id = req.params.id;
    const type = req.params.type; // 1 for comment , 2 reply
    const userId = req.user.id;
    var message = "";

    if (type == 1) {
      var removedata = await Comment.findOneAndRemove({
        _id: reply_comment_id,
        user_id: userId,
      });
      message = "Comment deleted.";
    } else if (type == 2) {
      var removedata = await Reply.findOneAndRemove({
        _id: reply_comment_id,
        user_id: userId,
      });
      message = "Reply deleted.";
    } else {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Type should be boolean , 1 for comment or 2 for reply",
          },
        ],
      });
    }

    res.json({
      success: true,
      msg: message,
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

// @route    Post api/users/login_otp
// @desc     Login with otp -- user
// @access   Private
router.post(
  "/login_otp",
  [check("email_phone", "Please enter valid email or phone").not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email_phone } = req.body;
      var phoneno = /^\d{10}$/;
      var email =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const event = new Date();
      event.setMinutes(event.getMinutes() + 5);
      var RendomNumberCode = Math.floor(100000 + Math.random() * 900000);

      if (email_phone.match(email)) {
        //check for email
        const checkEmail = await User.findOne({
          email: email_phone,
          verified: true,
          account_status: true,
          deleted: false,
        });
        if (checkEmail) {
          const SaveUserData = {
            verification_code: RendomNumberCode,
            verification_code_expire: event,
          };
          var saveNewUser = await User.findOneAndUpdate(
            { email: email_phone },
            { $set: SaveUserData },
            { new: true }
          );
          if (saveNewUser) {
            sgMail.setApiKey(sendGridAPiKey);
            const msg = {
              to: email_phone,
              from: fromEmail,
              templateId: forgotPasswordTemplateId,
              dynamicTemplateData: {
                subject: "Login with otp",
                username: saveNewUser.username,
                otp: RendomNumberCode,
              },
            };
            sgMail.send(msg, (error, result) => {
              if (error) {
                console.log(error);
              } else {
                return res.status(200).json({
                  success: true,
                  msg: "Otp sent.",
                });
              }
            });
          } else {
            return res.status(400).json({
              success: false,
              errors: [
                {
                  msg: "Please use registered email.",
                },
              ],
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            errors: [
              {
                msg: "Please use registered email.",
              },
            ],
          });
        }

        // let user = await User.findOne({phone: email_phone, deleted:0 });

        // if(user && user.account_verified == 0){
        //   show_mobile_verification_screen = true;
        //   var message = "Your OTP code is: "+phone_verification_code+'. The OTP code will expire after 5 minutes.';
        //   var otpSend = await client.messages.create({body: message, from: '+13182668073', to: `+91${email_phone}`});
        //   var userDetails = {};
        //   var otp_expired_time = new Date();
        //   otp_expired_time.setMinutes( otp_expired_time.getMinutes() + 5 );
        //   userDetails.otp_expired = otp_expired_time;
        //   userDetails.otp = phone_verification_code;
        //   // console.log('msg',message);
        //   await User.findOneAndUpdate(
        //     {phone: email_phone,deleted:0},
        //     { $set: userDetails },
        //     {new:true,upsert:true}
        //   );
        //   return res.json({
        //     success:true,
        //     message:'OTP send successfully',
        //     data: {
        //       show_mobile_verification_screen: show_mobile_verification_screen,
        //       show_email_verification_screen:show_email_verification_screen,
        //       profile:{
        //         phone: user.phone
        //       }
        //     }
        //   });
        // }

        // var phone = email_phone;
        // var deleted = 0;
        // var account_status = 0; // account 0 => Need verification, status is 1 => Active, 2 => Suspended , 3 => Deleted.
        // var created_at = new Date();
        // var account_verified = 0;
        // var message = "Your OTP code is: "+phone_verification_code+'. The OTP code will expire after 5 minutes.';
        // var otpSend = await client.messages.create({body: message, from: '+13182668073', to: `+91${phone}`});
        // var otp_expired = new Date();
        //   otp_expired.setMinutes( otp_expired.getMinutes() + 5 );
        //   otp_expired = otp_expired;
        //   console.log('msg',message);
      }
    } catch (error) {
      console.error(error.message);
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
  "/forgotPassword",
  [check("email", "Please include a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let user = await User.findOne({
        email: email,
        deleted: false,
        verified: true,
      });
      if (!user) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Please use registered email",
            },
          ],
        });
      } else {
        let userID = user._id;
        var email_verification_code = Math.floor(
          100000 + Math.random() * 900000
        );
        // set expiry for OTP
        var otp_expired = new Date();
        otp_expired.setMinutes(otp_expired.getMinutes() + 5);
        const passwordObject = {};
        passwordObject.verification_code_expire = otp_expired;
        passwordObject.verification_code = email_verification_code;
        passwordObject.updated_at = new Date();

        try {
          let personalData = {};
          personalData = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: passwordObject }
          );
          sgMail.setApiKey(sendGridAPiKey);
          const msg = {
            to: email,
            from: fromEmail,
            templateId: forgotPasswordTemplateId,
            dynamicTemplateData: {
              subject: "Forgot Password",
              username: user.username,
              otp: passwordObject.verification_code,
            },
          };
          sgMail.send(msg, (error, result) => {
            if (error) {
              console.log(error);
            } else {
              // console.log("Send email to user Done!");
              return res.json({
                success: true,
                msg: "Please check your email for OTP code.",
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
  "/verify_otp",
  [
    check("userId", "User id is required").not().isEmpty(),
    check("otp", "OTP must be of 6 digit numbers").matches(/^[0-9]{6}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { otp, userId } = req.body;
    let user_id = userId;
    try {
      function diff_minutes(dt2, dt1) {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.round(diff);
      }
      let userData = await User.findOne({ _id: user_id });

      // console.log(userData);

      if (userData.verification_code) {
        let otp_expired = userData.verification_code_expire;
        let currentDateTime = new Date();
        let expiredDateTime = new Date(otp_expired);
        var expiringDifference = diff_minutes(currentDateTime, expiredDateTime);

        if (otp == userData.verification_code) {
          if (expiringDifference < 0) {
            var user_otpToken = Math.random()
              .toString(36)
              .substring(2, 10)
              .concat(expiredDateTime.toISOString());
            var userDetails = {};
            userDetails.verification_code = null;
            userDetails.verification_code_expire = currentDateTime;
            userDetails.otp_token = user_otpToken;

            await User.findOneAndUpdate(
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
                  msg: "OTP is expired",
                  param: "otp",
                  location: "body",
                },
              ],
            });
          }
        } else if (otp != userData.verification_code) {
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
  "/change_password",
  [
    [
      check(
        "password",
        "Password should have( one uppercase , one lower case, one special char, one digit and min 6 char long )"
      ).matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
      ),
      check("userId", "User id is required").not().isEmpty(),
      check("otptoken", "Otptoken  is required").not().isEmpty(),
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
    const { userId, otptoken, password, confirm_password } = req.body;
    let user_id = userId;
    let user_otptoken = otptoken;

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
            param: "otptoken",
            msg: "Page Not Found",
          },
        ],
      });
    }

    let user = await User.findOne({ _id: user_id });

    if (user.otp_token !== user_otptoken) {
      return res.status(400).json({
        success: false,
        errors: [
          {
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
      personalData = await User.findOneAndUpdate(
        { _id: user_id },
        { $set: passwordObject }
      );
      if (personalData) {
        res.json({
          success: true,
          msg: "Password is updated successfully",
        });
      } else {
        res.json({
          success: false,
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

//for verify the verificatin expire link

router.get("/verification/:id/:otpToken", async (req, res) => {
  try {
    const user_id = req.params.id;
    const otpToken = req.params.otpToken;

    const token = await FrontendTokens.findOne({
      otp_token: otpToken,
      user_id: user_id,
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Invalid link.",
          },
        ],
      });
    }

    if (token) {
      const user = await User.findOne({ _id: user_id, otp_token: otpToken });
      if (!user) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Invalid link.",
            },
          ],
        });
      }
      if (user.otp_token !== otpToken) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              msg: "Link Expired",
            },
          ],
        });
      } else {
        res.json({
          success: true,
          msg: "Valid link.",
        });
      }
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

//resend otp

router.post("/resend_otp/:id", async (req, res) => {
  try {
    let user_id = req.params.id;

    let user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            msg: "Record not found!",
          },
        ],
      });
    } else {
      var otp_expired = new Date();
      otp_expired.setMinutes(otp_expired.getMinutes() + 5);
      const passwordObject = {};
      passwordObject.verification_code_expire = otp_expired;
      passwordObject.updated_at = new Date();
      let personalData = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: passwordObject },
        { new: true }
      );
      sgMail.setApiKey(sendGridAPiKey);
      const msg = {
        to: user.email,
        from: fromEmail,
        templateId: forgotPasswordTemplateId,
        dynamicTemplateData: {
          subject: "Forgot Password",
          username: user.username,
          otp: user.verification_code,
        },
      };
      sgMail.send(msg, (error, result) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Send email to user Done!");
          return res.json({
            success: true,
            msg: "Otp Send Successfully",
            data: user._id,
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
});

// @route    Get api/users/categories_subcategories_detail
// @desc     Get the categories_subcategories_detail
// @access   Private
router.get("/categories_subcategories_detail/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const details = await Categories.aggregate([
      {
        $match: {
          slug: slug,
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "category_id",
          pipeline: [
            {
              $match: {
                deleted: false,
              },
            },
          ],
          as: "subcategories",
        },
      },
      {
        $project: {
          title: { $ifNull: ["$title", ""] },
          description: { $ifNull: ["$description", ""] },
          slug: { $ifNull: ["$slug", ""] },
          banners: { $ifNull: ["$banners", ""] },
          pin_to_sidebar: { $ifNull: ["$pin_to_sidebar", ""] },
          publication_status: { $ifNull: ["$publication_status", ""] },
          created_at: { $ifNull: ["$created_at", ""] },
          updated_at: { $ifNull: ["$updated_at", ""] },
          deleted: { $ifNull: ["$deleted", ""] },
          subcategories: 1,
        },
      },
    ]);

    if (details.length == 0) {
      res.status(400).json({
        success: false,
        errors: {
          msg: "Record not found",
        },
      });
    }

    res.json({
      success: true,
      msg: "Record found",
      data: details[0],
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

// @route    post api/users/recent_history
// @desc     Trends recent_history
// @access   Private
router.post(
  "/recent_history",
  [check("trend_id", "Trend id is required").not().isEmpty()],
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
      const { trend_id } = req.body;

      const userId = req.user.id;

      const recent_history = await RecentHistory.findOneAndUpdate(
        {
          trend_id: trend_id,
          user_id: userId,
        },
        {
          $set: {
            trend_id: trend_id,
            user_id: userId,
            created_at: Date.now(),
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      res.json({
        success: true,
        msg: "Record saved",
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

// @route    Get api/users/recent_history
// @desc     Trends recent_history
// @access   Private
router.get("/recent_history", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    var recentHistory = await RecentHistory.find(
      { user_id: userId },
      { trend_id: 1, _id: 0 }
    )
      .sort({ created_at: -1 })
      .limit(10);

    recentTrendIds = [];
    recentHistory.forEach((ids) => {
      recentTrendIds.push(ids.trend_id);
    });

    var data = await Trends.aggregate([
      {
        $match: {
          _id: { $in: recentTrendIds },
          publication_status: true,
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          localField: "category_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "category_ids",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          foreignField: "_id",
          localField: "subcategory_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "subcategory_ids",
        },
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
          from: "liketrends",
          foreignField: "trend_id",
          localField: "_id",
          pipeline: [
            {
              $match: {
                like_dislike: false,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "disliketrends",
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $project: {
          title: 1,
          featured_images: 1,
          slug: 1,
          score: 1,
          gender: 1,
          publication_status: { $ifNull: ["$publication_status", false] },
          comment_status: 1,
          category_ids: 1,
          subcategory_ids: 1,
          tags_ids: 1,
          focus_tags_ids: 1,
          sub_heading: 1,
          summary: 1,
          review_summary: 1,
          reference_links: 1,
          featured_images: 1,
          video_link: 1,
          read_time: 1,
          seo: 1,
          popularity: 1,
          inventiveness: 1,
          engagement: 1,
          human_centricity: 1,
          score: 1,
          age_group: 1,
          geography: 1,
          mern2_compass: 1,
          format: 1,
          author: 1,
          preview_image: 1,
          author_type: 1,
          publication_status: 1,
          comment_status: 1,
          deleted: 1,
          created_at: 1,
          views_count_start_from: { $ifNull: ["$views_count_start_from", 0] },
          liketrends: { $size: "$liketrends" },
          disliketrends: { $size: "$disliketrends" },
        },
      },
    ]);

    if (data.length == 0) {
      return res.json({
        success: false,
        msg: "Record not found!",
        data: data,
      });
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

// @route    Get api/users/latest_trends
// @desc     get latest trends
// @access   Private
router.get("/latest_trends", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    var data = await Trends.aggregate([
      {
        $match: {
          publication_status: true,
          deleted: false,
        },
      },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          localField: "category_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "category_ids",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          foreignField: "_id",
          localField: "subcategory_ids",
          pipeline: [
            {
              $project: {
                _id: 1,
                title: 1,
              },
            },
          ],
          as: "subcategory_ids",
        },
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
          from: "liketrends",
          foreignField: "trend_id",
          localField: "_id",
          pipeline: [
            {
              $match: {
                like_dislike: false,
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
          as: "disliketrends",
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $limit: 6,
      },
      {
        $project: {
          title: 1,
          featured_images: 1,
          slug: 1,
          score: 1,
          gender: 1,
          publication_status: { $ifNull: ["$publication_status", false] },
          comment_status: 1,
          category_ids: 1,
          subcategory_ids: 1,
          tags_ids: 1,
          focus_tags_ids: 1,
          sub_heading: 1,
          // summary: 1,
          review_summary: 1,
          reference_links: 1,
          featured_images: 1,
          video_link: 1,
          read_time: 1,
          seo: 1,
          popularity: 1,
          inventiveness: 1,
          engagement: 1,
          human_centricity: 1,
          score: 1,
          age_group: 1,
          geography: 1,
          mern2_compass: 1,
          format: 1,
          author: 1,
          preview_image: 1,
          author_type: 1,
          publication_status: 1,
          comment_status: 1,
          deleted: 1,
          created_at: 1,
          views_count_start_from: { $ifNull: ["$views_count_start_from", 0] },
          liketrends: { $size: "$liketrends" },
          disliketrends: { $size: "$disliketrends" },
        },
      },
    ]);

    if (data.length == 0) {
      return res.json({
        success: false,
        msg: "Record not found!",
        data: data,
      });
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

// @route    Get api/fronend/one_sidebar_ads/:category_id
// @desc     get the sidebar content
// @access   Private
router.post(
  "/one_sidebar_ads",
  [
    check("categoryIds", "Category ids are required").isArray({
      min: 1,
      max: 50,
    }),
  ],
  async (req, res) => {
    try {
      const { categoryIds } = req.body;
      var data = "";
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).json({
          success: false,
          errors: errors.array(),
        });
      }
      async function AdsSidebarResult(arrayOfIds) {
        console.log("inital arr count function", arrayOfIds.length);
        var randomId =
          arrayOfIds[Math.floor(Math.random() * arrayOfIds.length)];
        console.log("random id", randomId);
        data = await AdsSidebar.findOne({
          deleted: false,
          categories_id: randomId,
        });
        if (data) {
          // console.log("data>>>>>>>>>>>>>>>>>>>>" , data)

          res.json({
            success: true,
            msg: "Record found",
            data: data,
          });
        } else {
          if (arrayOfIds.length == 1) {
            return res.status(200).json({
              success: false,
              errors: [
                {
                  msg: "No record found !",
                },
              ],
            });
          } else {
            const index = arrayOfIds.findIndex((item) => item === randomId);
            arrayOfIds.splice(index, 1);
            console.log("after slice ", arrayOfIds);
            AdsSidebarResult(arrayOfIds);
          }
        }
      }

      AdsSidebarResult(categoryIds);
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
// @route    Put api/users/ads_section
// @desc     Add the ads section
// @access   Private
// router.put('/ads_section' , [
//   check("image" , "Image is required").not().isEmpty()
// ],
// auth,
// async(req , res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

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

// })

// @route    Get api/users/recent_history_without_login
// @desc     Trends recent_history
// @access   Private
router.get(
  "/recent_history_without_login",
  [
    // check('trend_id' , 'Trend id is required').not().isEmpty(),
    // check('user_ip' , 'User ip is required').not().isEmpty()
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
      const { trend_id, user_ip } = req.body;

      var userIpAddress = "";
      axios
        .get(`https://api.db-ip.com/v2/free/self`)
        .then((response) => {
          //  const { id, title } = response.data
          userIpAddress = response.data;
          //  console.log("my ip response" , response.data)
          res.json({
            success: true,
            msg: "Record saved",
            dataUserIp: userIpAddress,
          });
        })
        .catch((error) => console.log("Error to fetch data\n"));

      // const userId = req.user.id

      // const recent_history = await RecentHistory.findOneAndUpdate({
      //   trend_id : trend_id,
      //   user_ip : user_ip
      // },
      // {
      //   $set :{
      //     trend_id : trend_id,
      //     user_ip : user_ip,
      //     created_at : Date.now()
      //   }
      // },
      // {
      //   new : true,
      //   upsert : true
      // }
      // );
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

// @route    Get api/users/get_history_of_page_views
// @desc     Get the recent history pages
// @access   Private
router.get("/get_history_of_page_views/:user_ip", async (req, res) => {
  try {
    const { user_ip } = req.params;

    var data = await PageHistory.find({ user_ip: user_ip });
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

// @route    Get api/users/history_of_pages
// @desc     Get the history of pages
// @access   Private
router.get("/history_of_pages", async (req, res) => {
  try {
    var historyOfpages = await PageHistory.aggregate([
      {
        $match: {
          deleted: 0,
        },
      },
      {
        $group: {
          _id: {
            url: "$page_visited_url",
            ip: "$user_id",
          },
          countUrl: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.url",
          count: { $sum: "$countUrl" },
        },
      },
    ]);

    if (historyOfpages.length == 0) {
      return res.status(200).json({
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
      msg: "Data fetched successfully.",
      data: historyOfpages,
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

// @route    Get api/users/recomended_trends
// @desc     Recomended post for as per the user intrest
// @access   Private
router.get("/recomended_trends/:pageNo", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const pageNo = req.params.pageNo;
    const showData = 10;
    const removeData = (pageNo - 1) * showData;
    const sortData = { created_at: -1 };
    // console.log(userId)
    // recomended trends  on like , save the trends
    const getUserRecomended = await Trends.aggregate([
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "savetocollections",
          pipeline: [
            {
              $match: {
                user_id: ObjectId(userId),
                deleted: false,
              },
            },
            {
              $project: {
                trend_id: 1,
              },
            },
          ],
          as: "Collection2",
        },
      },
      {
        $lookup: {
          from: "liketrends",
          pipeline: [
            {
              $match: {
                user_id: ObjectId(userId),
                deleted: false,
                like_dislike: true,
              },
            },
            {
              $project: {
                like_dislike: 1,
                trend_id: 1,
              },
            },
          ],
          as: "Collection3",
        },
      },
      {
        $addFields: {
          intrestData: {
            $concatArrays: ["$Collection2", "$Collection3"],
          },
        },
      },
      {
        $group: {
          _id: "$intrestData.trend_id",
        },
      },
      {
        $unwind: {
          path: "$_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "trends",
          localField: "_id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                deleted: false,
              },
            },
          ],
          as: "IntrestedTrends",
        },
      },
      {
        $project: {
          Union: {
            $concatArrays: ["$IntrestedTrends"],
          },
        },
      },
      {
        $unwind: {
          path: "$Union",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$Union",
        },
      },
      {
        $unwind: {
          path: "$category_ids",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          intrestedCategories: {
            $addToSet: "$category_ids",
          },
          notShowAgain: {
            $addToSet: "$_id",
          },
        },
      },
      {
        $project: {
          intrestedCategories: 1,
          notShowAgain: 1,
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "trends",
          let: {
            notShowTrends: "$notShowAgain",
            showCategoriesRelatedTrends: "$intrestedCategories",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: {
                    $in: ["$category_ids", "$$showCategoriesRelatedTrends"],
                  },
                },
                $expr: { $not: { $in: ["$_id", "$$notShowTrends"] } },
                deleted: false,
              },
            },
          ],
          as: "showTrends",
        },
      },
      {
        $project: {
          showTrends: 1,
          intrestedCategories: 1,
        },
      },
      {
        $unwind: {
          path: "$showTrends",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$showTrends",
        },
      },
      {
        $sort: sortData,
      },
      {
        $skip: removeData,
      },
      {
        $limit: showData,
      },
    ]);

    if (getUserRecomended.length == 0) {
      return res.status(200).json({
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
      msg: "Data fetched successfully.",
      data: getUserRecomended,
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

router.get("/get_discover_page_data", async (req, res) => {
  try {
    var result = await Categories.aggregate([
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "category_id",
          pipeline: [
            {
              $lookup: {
                from: "trends",
                localField: "_id",
                foreignField: "subcategory_ids",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                    },
                  },
                ],
                as: "trends",
              },
            },
            {
              $addFields: {
                value: {
                  $size: "$trends",
                },
              },
            },
            {
              $project: {
                name: { $ifNull: ["$title", ""] },
                value: 1,
              },
            },
          ],
          as: "children",
        },
      },
      {
        $project: {
          name: { $ifNull: ["$title", ""] },
          children: 1,
        },
      },
    ]);
    var data = [
      {
        name: "mern2 pr Trends",

        children: result,
      },
    ];
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

router.put("/update_trend_page_view_count", async (req, res) => {
  try {
    const { unique_url_calculated } = req.body;
    var checkRecordExists = await Trends.findOne({
      deleted: 0,
      publication_status: true,
      slug: unique_url_calculated,
    });
    if (checkRecordExists) {
      var updatedCount =
        Number(checkRecordExists.views_count_start_from) + Number(1);
      var result = await Trends.findOneAndUpdate(
        { deleted: 0, publication_status: true, slug: unique_url_calculated },
        {
          $set: {
            views_count_start_from: updatedCount,
          },
        }
      );
    }
    res.json({
      success: true,
      msg: "Record updated successfully",
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
module.exports = router;
