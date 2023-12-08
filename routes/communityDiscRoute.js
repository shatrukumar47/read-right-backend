const express = require("express");
const { CommunityDiscModel } = require("../models/communityDiscussion.model");
const authMiddleware = require("../middlewares/auth.middleware");

const communityDiscRoute = express.Router();

//Get all discussions
communityDiscRoute.get("/", async (req, res) => {
  try {
    const allDiscussions = await CommunityDiscModel.find(req.query);
    res.status(200).json(allDiscussions);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get all discussions by bookID
communityDiscRoute.get("/book/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const discussion = await CommunityDiscModel.find({ bookID: id });
    if (discussion) {
      res.status(200).json(discussion);
    } else {
      res.status(200).send({ msg: "Discussions not found!" });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get a single discussion by id
communityDiscRoute.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const discussion = await CommunityDiscModel.findOne({ _id: id });
    if (discussion) {
      res.status(200).json(discussion);
    } else {
      res.status(200).send({ msg: "Discussion not found!" });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Create a discussion
communityDiscRoute.post("/create", authMiddleware, async (req, res) => {
  try {
    const newDiscussion = new CommunityDiscModel(req.body);
    newDiscussion.save();
    res.status(200).send({
      msg: "Discussion created successfully",
      discussion: newDiscussion,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Update a discussion by id
communityDiscRoute.patch("/update/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;
  try {
    const checkDiscussion = await CommunityDiscModel.findOne({ _id: id });
    if (!checkDiscussion) {
      return res.status(200).send({ msg: "Discussion not found!" });
    }

    if (checkDiscussion.userID !== userID) {
      return res.status(403).json({ msg: "Access forbidden" });
    }

    await CommunityDiscModel.findByIdAndUpdate({ _id: id }, req.body);
    const updateDiscussion = await CommunityDiscModel.findOne({ _id: id });
    res
      .status(200)
      .send({ msg: "Updated successfully", discussion: updateDiscussion });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Delete a discussion by id
communityDiscRoute.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;
  try {
    const checkDiscussion = await CommunityDiscModel.findOne({ _id: id });
    if (!checkDiscussion) {
      return res.status(200).send({ msg: "Discussion not found!" });
    }

    if (checkDiscussion.userID !== userID) {
      return res.status(403).json({ msg: "Access forbidden" });
    }

    await CommunityDiscModel.findByIdAndDelete({ _id: id });
    res.status(200).send({ msg: "Deleted successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = {
  communityDiscRoute,
};
