const { check } = require("express-validator");
const slugify = require("slugify");

const bcrypt = require('bcryptjs');

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name required")
    .isLength({ min: 3 })
    .withMessage("Too short name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid Email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error(`Email Is already in use`));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirmation) {
        return Promise.reject(new Error(`password Confirmation incorrect`));
      }
      return true
    }),

  check('passwordConfirmation')
    .notEmpty()
    .withMessage("password Confirmation required")
    .isLength({ min: 6 })
    .withMessage("password Confirmation must be at least 6 characters"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone Number only eccepted Egy and SA numbers"),

  check("profileImg").optional(),

  check("role").optional(),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  check('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("you must enter your current password")
    .isLength({ min: 6 })
    .withMessage("currentPassword must be at least 6 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("you must enter the password confirm")
    .isLength({ min: 6 })
    .withMessage("passwordConfirm must be at least 6 characters"),

  check("password")
    .notEmpty()
    .withMessage("you must enter password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters")
    .custom(async (val, { req }) => {
      // 1) Verfiy current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error(`There is no user for this id`);
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      )
      if (!isCorrectPassword) {
        throw new Error(`Incorrect current password`);
      }
      // 2) Verfiy new Password Confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error(`password Confirmation incorrect`);
      }
      return true
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  validatorMiddleware,
];