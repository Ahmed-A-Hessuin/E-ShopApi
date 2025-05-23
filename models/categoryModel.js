const mongoose = require('mongoose');
// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    // A and B => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image &&  !doc.image.startsWith('https://')) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl
  }
}

//work in Create
categorySchema.post('save', (doc) => {
  setImageURL(doc);
});

// work in findOne , findAll and Update
categorySchema.post('init', (doc) => {
  setImageURL(doc);
});


// 2- Create model
module.exports = mongoose.model('Category', categorySchema);

