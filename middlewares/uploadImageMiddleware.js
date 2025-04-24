const multer = require('multer')
const ApiError = require('../utils/apiError');
// 1 - DiskStorage engine
// const multerStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/categories')
//     },
//     filename: function (req, file, cb) {
//         const ext = file.mimetype.split('/')[1]
//         const filename = `category-${uuidv4()}-${Date.now()}.${ext}`
//         cb(null, filename)
//     }
// })

// 2 - MemmoryStorge Engine
const multerOptions = () => {
    const multerStorage = multer.memoryStorage()
    const multerFilter = function (req, file, cd) {
        if (file.mimetype.startsWith("image")) {
            cd(null, true)
        } else {
            cd(new ApiError("Only Images allowed", 400), false)
        }
    }
    const upload = multer({ storage: multerStorage, fileFilter: multerFilter })
    return upload
}

exports.uploadSingleImage = (filedName) => multerOptions().single(filedName)
exports.uploadMixOfImages = (arrayOfFields) => multerOptions().fields(arrayOfFields)