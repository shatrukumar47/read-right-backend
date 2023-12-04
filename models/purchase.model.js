const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema(
  {
    userID: { type: String, required: true },
    books: { type: mongoose.Schema.Types.Mixed, required: true },
    purchase_date: { type: Date, default: Date.now },
    payment_details: { type: Array, required: true },
    pincode: { type: Number, required: true },
    amount: { type: Number, required: true },
    delivery_address: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const PurchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = {
  PurchaseModel,
};
