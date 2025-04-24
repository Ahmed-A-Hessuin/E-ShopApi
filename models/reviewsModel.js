const mongoose = require('mongoose');

const Product = require('./productModel')

// 1- Create Schema
const reviewSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        rating: {
            type: Number,
            min: [1, "Min rating value is 1.0"],
            max: [5, "Max rating value is 5.0"],
            required: [true, "Review rating must be required"]
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Review must belong to user"]
        },
        // Parent reference (one to many)
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: [true, "Review must belong to product"]
        }
    },
    {
        timestamps: true,
    }
);

reviewSchema.statics.calcAvrageRatingAndQuantity = async function (productId) {
    // stage 1 ) Get all reviews in specific product 
    const result = await this.aggregate([
        { $match: { product: productId } },
        // stage 2 ) Grouping reviews based on productId and calc ratingsAverage,ratingsQuantity
        {
            $group: {
                _id: "product",
                avgRatings: { $avg: "$rating" },
                ratingsQuantity: { $sum: 1 }
            }
        }
    ]);
    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: result[0].avgRatings,
            ratingsQuantity: result[0].ratingsQuantity
        })
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: 0,
            ratingsQuantity: 0
        })
    }
}

reviewSchema.post('save', async function () {
    await this.constructor.calcAvrageRatingAndQuantity(this.product);
});

reviewSchema.post('remove', async function () {
    await this.constructor.calcAvrageRatingAndQuantity(this.product);
});


reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: "user", select: "name" })
    next()
});

// 2- Create model
module.exports = mongoose.model('Review', reviewSchema);
