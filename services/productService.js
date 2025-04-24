const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const factory = require('./handlersFactory')
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware')
const Product = require('../models/productModel');



exports.uploadProductImages = uploadMixOfImages([{
    name: "imageCover",
    maxCount: 1,
},
{
    name: "images",
    maxCount: 5,
},
]);

exports.resizeProductImage = asyncHandler(async (req, res, next) => {
    //image Processing for ImagesCover
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`uploads/products/${imageCoverFileName}`)
    //Save ImageCover into db
    req.body.imageCover = imageCoverFileName;

    //image Processing fon Images
    if (req.files.images) {
        req.body.images = []
        await Promise.all(
            req.files.images.map(async (img, index) => {
                const imagesFileName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`
                await sharp(img.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 95 })
                    .toFile(`uploads/products/${imagesFileName}`)
                //Save ImageCover into db
                req.body.images.push(imagesFileName)
            })
        )
        next()
    }
})

// @desc    Get list of Products
// @route   GET /api/v1/Products
// @access  Public
exports.getProducts = factory.getAll(Product, "Product")

// @desc    Get specific Product by id
// @route   GET /api/v1/Products/:id
// @access  Public
exports.getProduct = factory.getOne(Product, "reviews")

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product)

// @desc    Update specific Product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product)

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product)

