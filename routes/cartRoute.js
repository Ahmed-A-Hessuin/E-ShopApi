const express = require('express');


const {
    addProductToCart,
    getLoggedUserCart,
    removeSpecificCartItem,
    clearCart,
    updateCartItemQuantity
} = require('../services/cartService');

const authService = require('../services/authService')

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"),)
router.route('/').post(addProductToCart).get(getLoggedUserCart).delete(clearCart)

router.route('/:itemId').put(updateCartItemQuantity).delete(removeSpecificCartItem)


module.exports = router;
