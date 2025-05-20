const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/Cloudinary');


const Category = require('../models/categoryModel');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware')
const factory = require('./handlersFactory')


//Upload single image
// Upload middleware
exports.uploadCategoryImage = uploadSingleImage('image');

// Resize and upload to Cloudinary
exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const processedBuffer = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'categories',
                public_id: `category-${uuidv4()}`,
                resource_type: 'image',
            },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        stream.end(processedBuffer);
    });

    req.body.image = result.secure_url;
    next();
});


// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(Category)

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category)

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category)

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category)

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category)
