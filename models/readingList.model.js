const mongoose = require("mongoose");

const readingListSchema = mongoose.Schema({
    userID: {type: String, required: true},
    username: {type: String, required: true},
    role: {type: String, required: true},
    title: {type: String, required: true},
    books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'book',
    },
  ],
}, {
    versionKey: false
})

const ReadingListModel = mongoose.model("readlingList", readingListSchema);

module.exports = {
    ReadingListModel
}