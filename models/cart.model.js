const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
});

const cartItemSchema = mongoose.Schema({
  book: { type: bookSchema, required: true },
  quantity: { type: Number, default: 1 },
});

const cartSchema = mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  items: [cartItemSchema],
});

const CartModel = mongoose.model("cart", cartSchema);

module.exports = {
  CartModel
};