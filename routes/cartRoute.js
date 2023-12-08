const express = require("express");
const { CartModel } = require("../models/cart.model");
const authMiddleware = require("../middlewares/auth.middleware");
const cartRouter = express.Router();


// Add book to cart
cartRouter.post("/add", authMiddleware, async (req, res) => {
    try {
      const { book, quantity } = req.body;
      const userID = req.body.userID;
  
      // Find the user's cart
      let cart = await CartModel.findOne({ userID });
  
      // If the cart doesn't exist, create a new one
      if (!cart) {
        cart = new CartModel({ userID, items: [] });
      }
  
      // Check if the book is already in the cart
      const existingItem = cart.items.find(item => item.book._id.equals(book._id));
  
      if (existingItem) {
        // If the book is already in the cart, update the quantity
        res.status(200).json({ message: "Already in the cart" , added: false });
      } else {
        // If the book is not in the cart, add a new item
        cart.items.push({ book, quantity });
        await cart.save();
        res.status(200).json({ message: "Added to cart", added: true });
      }
  
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
});



// Update quantity in cart
cartRouter.patch("/update-quantity/:bookId", authMiddleware, async (req, res) => {
    try {
      const bookId = req.params.bookId;
      const userID = req.body.userID;
      const newQuantity = req.body.quantity;
  
      // Find the user's cart
      const cart = await CartModel.findOne({ userID });
  
      if (!cart) {
        return res.status(200).json({ message: "Cart not found" });
      }
  
      // Find the item in the cart
      const itemToUpdate = cart.items.find(item => item.book._id.equals(bookId));
  
      if (!itemToUpdate) {
        return res.status(200).json({ message: "Book not found in the cart" });
      }
  
      // Update the quantity
      itemToUpdate.quantity = newQuantity;
  
      // Save the updated cart
      await cart.save();
  
      res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Internal Server Error" });
    }
});


// Get all items in the cart
cartRouter.get("/items", authMiddleware, async (req, res) => {
    try {
      const userID = req.body.userID;
  
      // Find the user's cart
      const cart = await CartModel.findOne({ userID });
  
      if (!cart) {
        return res.status(200).json({ message: "Cart not found" });
      }
  
      res.status(200).json({ items: cart.items });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }

});

// After the purchase is confirmed empty the cart
cartRouter.post("/complete-purchase", authMiddleware, async (req, res) => {
    try {
      const userID = req.body.userID;
  
      // Find the user's cart
      const cart = await CartModel.findOne({ userID });
  
      if (!cart) {
        return res.status(200).json({ message: "Cart not found" });
      }
  
      // Clear the items from the current cart
      cart.items = [];
  
      // Save the updated cart
      await cart.save();
  
      // Optionally, create a new cart for the user
      // const newCart = await CartModel.create({ userId, items: [] });
  
      res.status(200).json({ message: "Purchase completed successfully" });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
});

// Remove item from cart
cartRouter.delete("/remove/:bookId", authMiddleware, async (req, res) => {
  try {
    const userID = req.body.userID;
    const bookId = req.params.bookId;

    // Find the user's cart
    const cart = await CartModel.findOne({ userID });

    if (!cart) {
      return res.status(200).json({ message: "Cart not found" });
    }

    // Find the index of the item to remove
    const itemIndex = cart.items.findIndex(item => item.book._id.equals(bookId));

    if (itemIndex === -1) {
      return res.status(200).json({ message: "Book not found in the cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Item removed from the cart" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = {
    cartRouter
}
