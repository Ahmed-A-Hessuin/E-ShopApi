const multer = require('multer');
const ApiError = require('../utils/apiError');

// إعداد `multer` للتخزين في الذاكرة
const multerOptions = () => {
    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new ApiError('Only images are allowed', 400), false);
        }
    };

    return multer({ storage, fileFilter });
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);
exports.uploadMixOfImages = (fieldsArray) => multerOptions().fields(fieldsArray);
