const express = require('express');

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator
} = require('../utils/validators/reviewValidator');

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFiltrObject,
  setProductIdAndUserIdToBody

} = require('../services/reviewService');

const authService = require('../services/authService')

// mergeParams allow us to access prameters from another route
const router = express.Router({ mergeParams: true })

router.route('/')
  .get(createFiltrObject, getReviews)
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview);

router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo("user", "admin", "manager"),
    deleteReviewValidator,
    deleteReview,
  );

module.exports = router;
