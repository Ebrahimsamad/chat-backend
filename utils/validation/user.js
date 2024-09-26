const Joi = require("joi");

const signupValidation = Joi.object({
  fullName: Joi.string()
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(10)
    .messages({
      "string.base": "Full name must be a string.",
      "string.pattern.base":
        "Full name must only contain alphabetic characters and spaces.",
      "string.empty": "Full name is required.",
      "any.required": "Full name is required.",
      "string.min": "Full name must be at least 10 characters long.",
    }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^[A-Za-z\d]{8,128}$/)
    .messages({
      "string.base": "Password must be a string.",
      "string.pattern.base": "Password must contain only letters and numbers.",
      "string.min": "Password must be at least 8 characters long.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "confirm passwords must match, with password",
    "any.required": "Confirm Password is required.",
  }),
  phone: Joi.string()
    .pattern(/^(\+201|00201)[0-2,5]{1}[0-9]{8}$/)
    .required()
    .messages({
      "string.base": "Phone number must be a string.",
      "string.pattern.base":
        "Phone number must be a valid Egyptian phone number and start with (+20 or 0020).",
      "string.empty": "Phone number is required.",
      "any.required": "Phone number is required.",
    }),
  IDImage: Joi.object({
    buffer: Joi.binary().messages({
      "binary.base": "IDImage file data must be provided",
    }),
    mimetype: Joi.string()
      .regex(/^image\//)
      .messages({
        "string.base": "IDImage type must be a string",
        "string.pattern.base": "Invalid IDimage type",
      }),
  })
    .required()
    .messages({
      "any.required": "IDImage is required.",
      "object.base": "IDImage must be an object",
    }),
});
const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});
const verifyEmailValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
});
const forgetPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
});
const resetTokenCheckValidation = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "rest token is required.",
    "any.required": "rest token is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
});
const resetPasswordValidation = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "rest token is required.",
    "any.required": "rest token is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),
  newPassword: Joi.string()
    .min(8)
    .required()
    .pattern(/^[A-Za-z\d]{8,128}$/)
    .messages({
      "string.base": "Password must be a string.",
      "string.pattern.base": "Password must contain only letters and numbers.",
      "string.min": "Password must be at least 8 characters long.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),

  confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "confirm password must match, with new password",
    "any.required": "Confirm Password is required.",
  }),
});
module.exports = {
  signupValidation,
  loginValidation,
  forgetPasswordValidation,
  resetTokenCheckValidation,
  resetPasswordValidation,
  verifyEmailValidation,
};
