const mongoose = require("mongoose");

const bookReviewSchema = mongoose.Schema({
    userID: {type: String, required: true},
    username: {type: String, required: true},
    role: {type: String, required: true},
    bookID: {type: String, required: true},
    review: {type: String, required: true},
    rating: {type: Number, required: true},
},{
    versionKey: false
});

const BookReviewModel = mongoose.model("bookReview", bookReviewSchema);

module.exports = {
    BookReviewModel
}