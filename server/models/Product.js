const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  supplier: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);