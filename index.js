const express = require("express");
const cors = require("cors");
const { connection } = require("./db");
const { userRoute } = require("./routes/userRoute");
const { bookRouter } = require("./routes/bookRoute");
const { communityDiscRoute } = require("./routes/communityDiscRoute");
const { purchaseRoute } = require("./routes/purchaseRoute");
const { discussionPostRoute } = require("./routes/discussionPostRoute");
const { bookReviewRoute } = require("./routes/bookReviewRoute");
const { readingListRoute } = require("./routes/readingListRoute");
const { chatRouter } = require("./routes/chatbotRoute");
const { cartRouter } = require("./routes/cartRoute");



const app = express();
app.use(express.json());
app.use(cors());
app.use("/users", userRoute);
app.use("/books", bookRouter);
app.use("/community", communityDiscRoute);
app.use("/purchases", purchaseRoute);
app.use("/posts", discussionPostRoute);
app.use("/review", bookReviewRoute);
app.use("/reading-lists", readingListRoute);
app.use("/chatbot", chatRouter);
app.use("/cart", cartRouter);

app.get("/", (req, res)=>{
    res.status(200).send("Welcome to Read Right Backend")
})

app.listen(8080, async ()=>{
    try {
        await connection;
        console.log("Connected to DB")
        console.log("Server is live at Port 8080")
    } catch (error) {
        console.log(error)
    }
})