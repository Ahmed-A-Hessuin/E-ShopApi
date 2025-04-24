const express = require('express');
const {
    createProductValidator,
    getProductValidator,
    updateProductValidator,
    deleteProductValidator
} = require('../utils/validators/productValidator');

const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    resizeProductImage,
    uploadProductImages
} = require('../services/productService');

const authService = require('../services/authService')
const reviewRoute = require('./reviewRoute')

const router = express.Router();


// Nested routes
router.use('/:productId/reviews', reviewRoute);

router
    .route('/')
    .get(getProducts)
    .post(
        authService.protect,
        authService.allowedTo("admin", "manager"),
        uploadProductImages,
        resizeProductImage,
        createProductValidator,
        createProduct
    );
router
    .route('/:id')
    .get(getProductValidator, getProduct)
    .put(
        authService.protect,
        authService.allowedTo("admin", "manager"),
        uploadProductImages,
        resizeProductImage,
        updateProductValidator,
        updateProduct
    )
    .delete(
        authService.protect,
        authService.allowedTo("admin"),
        deleteProductValidator,
        deleteProduct);

module.exports = router;
