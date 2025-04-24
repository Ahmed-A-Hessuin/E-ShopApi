const factory = require('./handlersFactory')
const Review = require('../models/reviewsModel');


// Nested route
// GET api/v1/products/:productId/reviews
exports.createFiltrObject = (req, res, next) => {
    let filterObj = {}
    if (req.params.productId) filterObj = { product: req.params.productId }
    req.filterObj = filterObj
    next()
}
// @desc    Get list of Reviews
// @route   GET /api/v1/Reviews
// @access  Public
exports.getReviews = factory.getAll(Review)

// @desc    Get specific Review by id
// @route   GET /api/v1/Reviews/:id
// @access  Public
exports.getReview = factory.getOne(Review)

// Nested route (Create)
// Post api/v1/products/:productId/reviews
exports.setProductIdAndUserIdToBody = (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user._id;

    next()
}
// @desc    Create Review
// @route   POST  /api/v1/Reviews
// @access  Protuct / Private-User
exports.createReview = factory.createOne(Review)

// @desc    Update specific Review
// @route   PUT /api/v1/Reviews/:id
// @access  Protuct / Private-User
exports.updateReview = factory.updateOne(Review)

// @desc    Delete specific Review
// @route   DELETE /api/v1/Reviews/:id
// @access  Protuct / Private-User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review)

