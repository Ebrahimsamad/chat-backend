const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const singleImageUpload = require("../middlewares/uploadSingleImage");
const {
  signupValidation,
  loginValidation,
  forgetPasswordValidation,
  resetTokenCheckValidation,
  resetPasswordValidation,
  verifyEmailValidation,
} = require("../utils/validation/user");
const validation = require("../middlewares/joiValidation");
const {
  signup,
  login,
  verifyEmail,
  forgetPassword,
  resetPassword,
  resetPasswordCheckToken,
} = require("../controllers/user");

router.post(
  "/signup",
  upload.fields([{ name: "IDImage", maxCount: 1 }]),
  validation(signupValidation),
  singleImageUpload,
  signup
);

router.post("/login", validation(loginValidation), login);

router.post("/verify-email", validation(verifyEmailValidation), verifyEmail);

router.post(
  "/forgot-password",
  validation(forgetPasswordValidation),
  forgetPassword
);

router.post(
  "/reset-password-check",
  validation(resetTokenCheckValidation),
  resetPasswordCheckToken
);

router.post(
  "/reset-password",
  validation(resetPasswordValidation),
  resetPassword
);

module.exports = router;
