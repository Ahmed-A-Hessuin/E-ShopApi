const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewsModel');

exports.createReviewValidator = [
  check('title')
    .optional(),
  check('rating')
    .notEmpty()
    .withMessage("reting value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating value must be between 1 and 5'),
  check('user').isMongoId().withMessage('Invalid Review id format'),
  check('product').isMongoId().withMessage('Invalid Review id format').custom((val, { req }) =>
    // Check if logged user create review before
    Review.findOne({ user: req.user._id, product: req.body.product }).then((review) => {
      if (review) {
        return Promise.reject(new Error('You aleardy created a review before', 400))
      }
    })
  ),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format')
    // Check review onership before update
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is no review for this id ${val}`))
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(new Error('You Are not allowed to perform this action',))
        }
      })),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format')
    .custom((val, { req }) => {
      // Check review onership before deleting
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(new Error(`There is no review for this id ${val}`))
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(new Error('You Are not allowed to perform this action',))
          }
        })
      }
      return true;
    }),
  validatorMiddleware,
];
