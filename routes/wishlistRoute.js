const express = require('express');

const {
    addProductToWishlist,
    removeProductFromWishlist,
    getLoggedUserWishList
} = require('../services/wishlistServise');

const authService = require('../services/authService')

const router = express.Router();
router.use(authService.protect, authService.allowedTo('user'))

router.route('/')
    .post(addProductToWishlist)
    .get(getLoggedUserWishList);
router.delete('/:productId', removeProductFromWishlist);


module.exports = router;
