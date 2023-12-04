const mongoose = require("mongoose");

const discussionSchema = mongoose.Schema({
    userID: {type:String, required: true},
    username: {type:String, required: true},
    role: {type:String, required: true},
    bookID: {type:String, required: true},
    title: {type:String, required: true},
    description: {type:String, required: true},
    topic: {type:String, required: true},
},{
    versionKey: false
})

const CommunityDiscModel = mongoose.model("communityDiscussion", discussionSchema);

module.exports = {
    CommunityDiscModel
}