const express = require("express");
const { BookModel } = require("../models/book.model");
const authMiddleware = require("../middlewares/auth.middleware");
const { parse } = require("dotenv");

const bookRouter = express.Router();

//Get all books
bookRouter.get("/", async (req, res) => {
  try {
    const { sort, order, page, limit, query } = req.query;

    const mongoQuery = {};

    //applying search query
    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: "i" } }, // i for case-sensitive
        { author: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ];
    }

    //applying sorting
    let sortOptions = sort ? { [sort]: order === "desc" ? -1 : 1 } : {};

    //aggregation framework for pagination and sorting
    let pipeline = [];
    if (sort) {
      pipeline = [
        { $match: mongoQuery },
        { $sort: sortOptions },
        // { $skip: (page - 1) * limit },
        // { $limit: parseInt(limit) },
      ];
    } else {
      pipeline = [
        { $match: mongoQuery },
      ];
    }

    const books = await BookModel.aggregate(pipeline);

    //Get the total count of matching documents for pagination
    const totalCount = books.length;
    const totalBooks = await BookModel.countDocuments();


    res.status(200).json({
      books,
      totalCount,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get books with authoID
bookRouter.get("/author-books", authMiddleware, async (req, res)=>{
  const authorID = req.body.userID;
  try {
    const books = await BookModel.find({authorID: authorID})
    res.json(books);

  } catch (error) {
    res.status(400).send({ error: error.message });
  }
})

//Add Book
bookRouter.post("/add", authMiddleware, async (req, res) => {
  const {
    userID,
    role,
    username,
    image,
    title,
    author,
    genre,
    description,
    price,
  } = req.body;
  if (role === "reader") {
    return res.status(403).json({ msg: "Access forbidden" });
  }

  try {
    const checkExistingBook = await BookModel.findOne({
      title: req.body.title,
    });
    if (checkExistingBook) {
      res.status(200).send({ msg: "Book already exists!" });
    } else {
      const newBook = new BookModel({
        authorID: userID,
        image,
        title,
        author,
        genre,
        description,
        price,
      });
      await newBook.save();
      res.status(200).send({ msg: "Book added successfully", book: newBook });
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get a single book with id
bookRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const book = await BookModel.findOne({ _id: id });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Update a book by id
bookRouter.patch("/update/:id", authMiddleware, async (req, res) => {
  const { userID, role, username, title, author, genre, description, price } =
    req.body;
  const { id } = req.params;

  if (role === "reader") {
    return res.status(403).json({ msg: "Access forbidden" });
  }

  try {
    const checkAvailability = await BookModel.findOne({ _id: id });
    if (!checkAvailability) {
      res.status(200).send({ msg: "Book not found!" });
    } else {
      await BookModel.findByIdAndUpdate(
        { _id: id },
        { title, author, genre, description, price }
      );
      const updatedBook = await BookModel.findOne({ _id: id });
      res.status(200).json(updatedBook);
    }
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Delete a book by id
bookRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (role === "reader") {
    return res.status(403).json({ message: "Access forbidden" });
  }

  try {
    await BookModel.findByIdAndDelete({ _id: id });
    res.status(200).send({ msg: `Book with _id: ${id} deleted` , deleted: true});
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = {
  bookRouter,
};
