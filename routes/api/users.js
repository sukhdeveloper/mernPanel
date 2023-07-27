
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, (new Date().getTime()+file.originalname).replace(/\s+/g, ''));
  }
});

const fileFilter = (req, file, cb) => {
    cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// @route    POST api/users/forgotPassword
// @desc     Forgot Password
// @access   Public
router.post(
  '/forgotPassword',
  [
    check('phone', 'Please enter valid phone number')
      .matches(/^(?=.*[0-9])(?=.{10,10})/)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success:false,
        errors: errors.array() });
    }

    const { phone } = req.body;

    try {
      let user = await User.findOne({ phone : phone,deleted:0});
      if (!user) {
        return res
          .status(400)
          .json({ 
            success:false,
            errors: [{
              "status" : 0,
              "response": "error" ,
              "param":"email",
              "msg":"Please use registered phone"
          }] 
        });
      }else{
        var phone_verification_code = Math.floor(1000 + Math.random() * 900000);
        var message = "Your OTP code is: "+phone_verification_code+'. The OTP code will expire after 5 minutes.';
        var otpSend = await client.messages.create({body: message, from: '+13182668073', to: `+91${phone}`});
        var otp_expired = new Date();
        otp_expired.setMinutes( otp_expired.getMinutes() + 5 );
        otp_expired = otp_expired;
        // console.log('msg',message);
        var userDetails = {};
         let otp = phone_verification_code;
         userDetails.phone = phone;
         userDetails.otp = otp;
         userDetails.otp_expired = otp_expired;
        await User.findOneAndUpdate(
          {phone: phone,deleted:0},
          { $set: userDetails }
        );
        //await user.save();
        return res.json({
          success:true,
          message:'OTP send successfully'
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success:false,
        "errors": [
          {
              "msg": "Server error",
              "param": "server",
              "location": "body"
          }
      ]});
    }
      
  }
);

// @route    POST api/users/verifyOtpAfterForgotPassword
// @desc     Forgot password otp verification
// @access   Public
router.post(
  '/verifyOtpAfterForgotPassword',
  [
    check(
      'phone',
      'Please enter valid number'
    ).isLength({ min: 10,max:10 }),
    check(
      'otp',
      'OTP must be of 4 digit numbers'
    ).matches(/^[0-9]{6}$/)
    
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success:false, errors: errors.array() });
    }

    const { 
            phone,
            otp
           } = req.body;

    try {
      function diff_minutes(dt2, dt1) 
        {

          var diff =(dt2.getTime() - dt1.getTime()) / 1000;
          diff /= 60;
          return (Math.round(diff));
          
        }
        var userData = await User.findOne({phone: phone,deleted:0},{otp_expired:1,otp:1});
        console.log(userData);
        if(userData){
          let otp_expired = userData.otp_expired;
      
          let currentDateTime = new Date();
          let expiredDateTime = new Date(otp_expired);
          var expiringDifference = diff_minutes(currentDateTime, expiredDateTime);
          //console.log(expiringDifference);
          if(otp == userData.otp){
            if(expiringDifference<0){
              var userDetails = {};
              userDetails.otp_expired = new Date();
              userDetails.otp = null;
              userDetails.account_verified = 1;
              userDetails.account_status = 1;
              await User.findOneAndUpdate({phone: phone},{$set:userDetails});
              
              var user_id = userData.id;
             
                  res.json({
                    success:true,
                    message:'OTP verified successfully',
                    data:{
                      id:user_id
                   } });
            }else{
              res.status(400).send({
                success:false,
                "errors": [
                  {
                      "msg": "OTP get expired",
                      "param": "otp",
                      "location": "body"
                  }
              ]
              });
            }
          }
         
          else if(otp != userData.otp){
            res.status(400).send({
              success:false,
              "errors": [
                {
                    "msg": "OTP is not valid",
                    "param": "otp",
                    "location": "body"
                }
            ]
            });
          }
        }else{
          res.status(400).send({
            success:false,
            "errors": [
              {
                  "msg": "No Record Found with this phone",
                  "param": "phone",
                  "location": "body"
              }
          ]
          });
        }
      
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success:false,
        "errors": [
          {
              "msg": "Server error",
              "param": "server",
              "location": "body"
          }
      ]
      });
    }
  }
);

// @route    POST api/users/createPassword
// @desc     Create password after otp verification (Forgot Password)
// @access   Private
router.put(
  '/createPassword/:id',
  [
    
    [
      check(
        'new_password',
        'New password should have( one uppercase , one lower case, one special char, one digit and min 6 char long )'
      ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/),
      check(
        'confirm_password',
        'Confirm Password should matched with new password'
      ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/)
    ],
  ],
  async (req, res) => {
      const errors = validationResult(req);
      var err = [];
      if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success:false,
        errors: errors.array() 
      });
      }
      const { 
          new_password, 
          confirm_password
      } = req.body;

      if(new_password !== confirm_password){
          return res
              .status(400)
              .json({ 
                success:false,
                errors: [{
                "response": "error" ,
                "param":"confirm_password",
                "msg":"Confirm password does not matched with new password"
            }] });
        }

      // Build passwordObject
    const salt = await bcrypt.genSalt(10);

    const passwordObject = {};
    if (new_password) passwordObject.password = await bcrypt.hash(new_password, salt);
    passwordObject.updated_at = new Date();

    try {
      // Using upsert option (creates new doc if no match is found):
      let personalData = await User.findOneAndUpdate(
        {_id: req.params.id,deleted:0},
        { $set: passwordObject }
      );
      res.json({
          "success" : true,
          "response": "successful" ,
          "message":"Password is updated successfully"
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success:false,
        "errors": [
          {
              "msg": "Server error",
              "param": "server",
              "location": "body"
          }
      ]
      });
    }
  
  }
      
);

// @route    POST api/users/signin
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/signin',
  [
    check(
      'phone',
      'Please enter valid number'
    ).isLength({ min: 10,max:10 }),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success:false,
        errors: errors.array() });
    }

    const { phone, password } = req.body;

    try {
      let user = await User.findOne({ phone : phone, deleted:0 });

      if (!user) {
        return res
          .status(400)
          .json({ 
            success:false,
            errors: [{
              "response": "error" ,
              "param":"phone",
              "msg":"Please use registered phone"
          }] 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ 
            success:false,
            errors: [{
            "status" : 0,
            "response": "error" ,
            "param":"password",
            "msg":"Please use correct password"
        }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            success:true,
            message:'Login success',
            data:{
              token: token,
              profile: user
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send({
        success:false,
        "errors": [
          {
              "msg": "Server error",
              "param": "server",
              "location": "body"
          }
      ]
      });
    }
  }
);






module.exports = router;



