const express = require('express');
const {
  signUpValidator,
  loginValidator
} = require('../utils/validators/authValidator');

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword
} = require('../services/authService');


const router = express.Router();

router.post('/signup', signUpValidator, signup)
router.post('/login', loginValidator, login)
router.post('/forgotPassword', forgotPassword)
router.post('/verifyPassResetCode', verifyPassResetCode)
router.put('/resetPassword', resetPassword)



module.exports = router;
