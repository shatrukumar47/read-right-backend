const express = require("express");
const OpenAI = require("openai");
const { BookModel } = require("../models/book.model");
require("dotenv").config();

const chatRouter = express.Router();

//OpenAI Generation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

chatRouter.post("/", async (req, res) => {
  const { userMessage } = req.body;
  try {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `[Act as Read-Right Customer Support Executive]\n Read-Right is an online platform to purchase books, start community discussion, creating reading-list and author can publish their books for sale.\nOwner of this website is Shatrughan Kumar, a Full Stack Web Developer.\nGreet the user in a beautiful manner with a quote on book.\nYour task is to help and assist users for better coordination.\n If user asks for any book or purchase related query then ask the user for OrderID number, user email, and the main issue and in reponse you say {Thank You for your coordination.\n Rest assured Our Executiive Support team will reach you soon.\nThank You for visiting Read-Right.\nLet me know if you have any other query}.\n If user mentions any suggestions related to book name, author name or book genre then provide the response only as author name for example "Paulo Coelho" or book name for example "The Alchemy" or author name for example "Horror" and do not generate any other words or sentences.\nIf user as questions includes sentence like "Suggest me some books" then generate response as "books" and nothing else.\n If user ask about a specific book detail then generate response in a structured manner mentioning the book name, author name, description of the book, rating of the book, published year.\n In any scenario generate response in maximum 30 words and try to generated as less words as possible in a structured way.\nIf user ask any random questions which is not related to this website or books then generate reponse as "Sorry, I didn't understand that. Please ask query related to books."\n ###user query: "${userMessage}"`,
          },
        ],
        temperature: 1.5,
        max_tokens: 279,
        top_p: 1,
        frequency_penalty: 1.01,
        presence_penalty: 1.03,
      });

      let chatbotResponse = response.choices[0].message.content || "Sorry, I didn't understand that.";



      //Generating integer less than 40
      const randomValue = Math.floor(Math.random() * 45);

      if(chatbotResponse === "books"){
        const books = await BookModel.find().skip(randomValue).limit(5);
        return res.status(200).json(books);
      }
      
      if(chatbotResponse.length <= 15){
        if(chatbotResponse.toLowerCase().includes("horror")){
          chatbotResponse = "horror"
        }else
        if(chatbotResponse.toLowerCase().includes("science fiction")){
          chatbotResponse = "science fiction"
        }else
        if(chatbotResponse.toLowerCase().includes("romance")){
          chatbotResponse = "romance"
        }else
        if(chatbotResponse.toLowerCase().includes("mystery")){
          chatbotResponse = "mystery"
        }else
        if(chatbotResponse.toLowerCase().includes("historical")){
          chatbotResponse = "historical"
        }


        const books = await BookModel.find({
          or$: [
            {title: {$regex: new RegExp(chatbotResponse, "i")}},
            {author: {$regex: new RegExp(chatbotResponse, "i")}},
            {genre: {$regex: new RegExp(chatbotResponse, "i")}}
          ]
        }).limit(5)

        if(books.length === 0){
          const books = await BookModel.find().skip(randomValue).limit(5);
          return res.status(200).json(books);
        }else{
          return res.status(200).json(books);
        }
      }else
      if(chatbotResponse.length > 250){
        return res.status(200).send({ response:"Sorry, I didn't understand that. Please try again later."});
      }
      
      return res.status(200).send({ response:  chatbotResponse});


  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = {
  chatRouter,
};
