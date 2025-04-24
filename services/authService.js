const crypto = require('crypto');

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const sendEmail = require('../utils/sendEmail')
const createToken = require('../utils/createToken')
const User = require('../models/userModel')


// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
    // 1-create user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    // 2- Generate token
    const token = createToken(user._id)

    res.status(201).json({ Data: user, token })
})

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {

    // 1) check if user exist && check if password is correct
    const user = await User.findOne({ email: req.body.email })

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new ApiError('Incorrect email or password', 401))
    }
    // 2) Generate token
    const token = createToken(user._id)
    // 3) Send res to Client
    res.status(200).json({ Data: user, token })
})

// @desc make sure that user logged in 
exports.protect = asyncHandler(async (req, res, next) => {
    // 1) check if token exists, if exists get it 
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
        return next(new ApiError('you are not login, Pleace login to get access this route', 401))
    }
    // 2) Verify token (no change happens , expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

    //3) Check if user exists
    const currentUser = await User.findById(decoded.userId)
    if (!currentUser) {
        return next(new ApiError("The user that belong to this token does no longer exist", 401))
    }

    // 4) check if user change his password after create token 
    if (currentUser.passwordChangedAt) {
        const passChangedAtTimeStamp = parseInt(
            currentUser.passwordChangedAt.getTime() / 1000
            , 10)
        //Password changed After token created (Error)
        if (passChangedAtTimeStamp > decoded.iat) {
            return next(new ApiError('user recently changed his password. please login again...', 401))
        }
    }
    req.user = currentUser
    next()
})

// @desc Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) => asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered users (req.user.role)
    if (!roles.includes(req.user.role)) {
        return next(new ApiError("you are not allowed to access this route", 403)
        );
    }
    next();
})

// @desc    Forgot Password
// @route   Post /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user by email address 
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(
            new ApiError(`There is no user for This email ${req.body.email}`, 404)
        )
    }
    // 2) if user exists Generate hased reset 6 digits and save it in db 
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex');
    // save password reset code in database
    user.passwordResetCode = hashedResetCode;
    //Add expiration time for password reset code (10 min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerify = false

    await user.save();

    // 3) send the reset code via email
    const message = `Hi ${user.name},\n We received a request to reset your password on E-shop Account \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helps us keep your account secure.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'your password Reset code (valid for 10 min)',
            message,
        });
        res
            .status(200)
            .json({ status: "Success", message: "Reset code send to email" })

    } catch (err) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerify = undefined;

        await user.save();
        return next(new ApiError('there is an error in sending email', 500));
    };

})

// @desc    verify Pass Reset Code
// @route   Post /api/v1/auth/verifyPassResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    // 1) Get the user based on the reset code
    const hashedResetCode = crypto
        .createHash('sha256')
        .update(req.body.resetCode)
        .digest('hex');
    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() }
    })
    if (!user) {
        next(new ApiError('Reset code is Invalid or expired'));
    }

    // 2) Reset code valid
    user.passwordResetVerify = true;
    await user.save();
    res.status(200).json({ status: "Success" })

})

// @desc    Reset password
// @route   Post /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1) Get the user based on Email address
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        next(new ApiError(`There is no user with this email ${req.body.email}`, 404));
    }

    // 2) Check if reset code is varified
    if (!user.passwordResetVerify) {
        next(new ApiError(`Reset code is not varified`, 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerify = undefined

    await user.save();

    // 3) if everythings is ok, genarate token
    const token = createToken(user._id)
    res
        .status(200)
        .json({ token })
})