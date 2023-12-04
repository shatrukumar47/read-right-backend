const express = require("express");
const { DiscussionPostModel } = require("../models/discussionPost.model");
const authMiddleware = require("../middlewares/auth.middleware");

const discussionPostRoute = express.Router();

//Get all discussion posts by discussionID
discussionPostRoute.get("/:id", async (req, res)=>{
    const {id} = req.params;
    try {
        const posts = await DiscussionPostModel.find({discussionID: id});
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).send({error: error.message});
    }
})

// create a post
discussionPostRoute.post("/create/:id",authMiddleware, async(req, res)=>{

    const discussionID = req.params.id;

    try {
        const newPost = new DiscussionPostModel({...req.body, discussionID});
        await newPost.save();
        res.status(200).send({"msg": "Post created", post: newPost});
    } catch (error) {
        res.status(400).send({error: error.message});
    }
})

//delete a post by id
discussionPostRoute.delete("/delete/:id", authMiddleware, async(req, res)=>{
    const postID = req.params.id;
    const {userID} = req.body;
    try {

        const checkPost = await DiscussionPostModel.findOne({ _id: postID });
        if (!checkPost) {
          return res.status(200).send({ msg: "Post not found!" });
        }
    
        if(checkPost.userID !== userID){
          return res.status(403).json({ msg: 'Access forbidden' });
        }

        await DiscussionPostModel.findByIdAndDelete({_id: postID});
        res.status(200).send({"msg": "Deleted successfully"})
    } catch (error) {
        res.status(400).send({error: error.message});
    }
})



module.exports = {
    discussionPostRoute
}