const express = require('express');
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require('../utils/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  uploadUserImage,
  resizeImage,
  getLoggedUserData,
  updateloggedUserPassword,
  updateloggedUserData,
  deleteloggedUser
} = require('../services/userService');

const authService = require('../services/authService')

const router = express.Router();
router.use(authService.protect)

router.get('/getMe', getLoggedUserData, getUser)
router.put('/updateMyPassword', updateloggedUserPassword)
router.put('/updateMe', updateLoggedUserValidator, updateloggedUserData)
router.delete('/deleteMe', deleteloggedUser)


//Admin
router.use(authService.allowedTo("admin"))
router.put('/changePassword/:id', changeUserPasswordValidator, changeUserPassword)

router.route('/')
  .get(
    getUsers
  )
  .post(
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser,
  );

router.route('/:id')
  .get(
    getUserValidator,
    getUser
  )
  .put(
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser,
  )
  .delete(
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
