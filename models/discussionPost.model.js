const mongoose = require("mongoose");

const discussionPostSchema = mongoose.Schema({
    discussionID : {type: String, required: true},
    userID : {type: String, required: true},
    username : {type: String, required: true},
    role : {type: String, required: true},
    message : {type: String, required: true},
    timestamp : {type: Date, default: Date.now},
}, {
    versionKey: false
})

const DiscussionPostModel = mongoose.model("discussionPost", discussionPostSchema);

module.exports = {
    DiscussionPostModel
}