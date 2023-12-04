const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { ReadingListModel } = require("../models/readingList.model");

const readingListRoute = express.Router();

//get all list for public
readingListRoute.get("/", async (req, res) => {
  try {
    const allLists = await ReadingListModel.find();
    res.status(200).json(allLists)
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//get all list by userID
readingListRoute.get("/user", authMiddleware, async (req, res) => {
  const { userID } = req.body;
  try {
    const list = await ReadingListModel.find({ userID: userID });
    res.status(200).json(list);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//create a reading list 
readingListRoute.post("/create", authMiddleware, async (req, res)=>{
  const {userID, username, role, title} = req.body;
  try {
    const newReadingList = new ReadingListModel({userID, username, role, title, books:[]});
    await newReadingList.save();
    res.status(201).json(newReadingList);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
})

 // Add a book to a reading list with reading list id
 readingListRoute.post("/addbook/:id", authMiddleware, async (req, res)=>{
  const readingListID = req.params.id;
  const { bookID } = req.body;
  try {
    const readingList = await ReadingListModel.findById(readingListID);
    if(readingList){
      // Check if the book is not already in the reading list
      if (!readingList.books.includes(bookID)) {
        readingList.books.push(bookID);
        const updatedReadingList = await readingList.save();
        res.json({updatedReadingList, msg: "Book added ✔"});
      }else {
        res.status(200).json({ msg: 'Book already in the reading list' });
      }
    }else {
      res.status(200).json({ msg: 'Reading list not found' });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
 })

 // Get details of a reading list with books
 readingListRoute.get("/:id", authMiddleware, async(req, res)=>{
  const readingListID = req.params.id;
  try {
    const readingList = await ReadingListModel.findById(readingListID).populate('books');
 
    if (readingList) {
      res.json(readingList);
    } else {
      res.status(404).json({ msg: 'Reading list not found' });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
 })



//delete a reading list by id
readingListRoute.delete("/delete/:id", authMiddleware, async (req, res)=>{
  const {id} = req.params;
  const {userID} = req.body;
  try {

    const checkReadingList = await ReadingListModel.findOne({ _id: id });
    if (!checkReadingList) {
      return res.status(200).send({ msg: "Reading-list not found!" });
    }

    if(checkReadingList.userID !== userID){
      return res.status(403).json({ msg: 'Access forbidden' });
    }


    await ReadingListModel.findByIdAndDelete({_id: id});
    res.status(200).send({"msg": "Reading list deleted"})
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
})

module.exports = {
  readingListRoute,
};
