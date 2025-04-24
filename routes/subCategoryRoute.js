
const express = require('express')

const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFiltrObject
} = require('../services/subCategoryService');


const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator
} = require('../utils/validators/subCategoryValidator')

const authService = require('../services/authService')

// mergeParams allow us to access prameters from another route
// ex : we need acces categoryId in categoryRoute to send it sebCateories route
const router = express.Router({ mergeParams: true })


router.route('/')
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory)
  .get(createFiltrObject, getSubCategories)

router.route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updateSubCategoryValidator,
    updateSubCategory)
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory)

module.exports = router;