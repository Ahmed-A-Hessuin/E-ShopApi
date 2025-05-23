const mongoose = require('mongoose');
// 1- Create Schema
const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [2, 'Too short product title'],
            maxlength: [100, 'Too long product title'],
        },
        slug: {
            type: String,
                lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            minlength: [10, 'Too short product description'],
        },
        quantity: {
            type: Number,
            required: [true, 'Product quantity is required'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            trim: true,
            max: [200000000, 'Too long product price'],
        },
        type: {
            type: String,
            required: [true, 'Type of Product is required'],
            enum: ['used', 'new'],

        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        priceAfterDiscount: {
            type: Number,
        },
        colors: [String],
        imageCover: {
            type: String,
            required: [true, 'Product Image cover is required'],
        },
        images: [String],
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'Category',
            required: [true, 'Product must be belong to category'],
        },
        subcategories: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'SubCategory',
            },
        ],
        brand: {
            type: mongoose.Schema.ObjectId,
            ref: 'Brand',
        },
        ratingsAverage: {
            type: Number,
            min: [1, 'Rating must be above or equal 1.0'],
            max: [5, 'Rating must be below or equal 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },

    },
    {
        timestamps: true,
        //passing options, getting the virual properties to the document/object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//Virtual populate
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id',
});


productSchema.pre(/^find/, function (next) {
    this.populate({
        path: "category",
        select: "name -_id"
    })
    next()
})

const setImageURL = (doc) => {
    if (doc.imageCover) {
        const imageUrl = `${process.env.BASE_URL}/Products/${doc.imageCover}`;
        doc.imageCover = imageUrl
    }
    if (doc.images) {
        const imagesList = []
        doc.images.forEach((img) => {
            const imageUrl = `${process.env.BASE_URL}/Products/${img}`
            imagesList.push(imageUrl)
        })
        doc.images = imagesList
    }
}

// work in findOne , findAll and Update
productSchema.post('save', (doc) => {
    setImageURL(doc);
});

//work in Create
productSchema.post('init', (doc) => {
    setImageURL(doc);
});
// 2- Create model
module.exports = mongoose.model('Product', productSchema);

