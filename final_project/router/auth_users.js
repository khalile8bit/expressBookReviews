const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const JWT_SECRET = "khalil";
let users = [];

const isValid = (username)=>{ 
    let x = users.filter((user) => {
        return user.username === username;
      });
      if (x.length > 0)
        return false;
    return true;
}

const authenticatedUser = (username,password)=>{ 
    let x = users.filter((user) => {
        return user.username === username && user.password === password;
      });
    
      if (x.length > 0)
        return true;
      return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    
    res.send("deleted successfully.");
    const username = req.query.username;
    const password = req.query.password;
  
    // If no username and/or password was provided.
    if (!username || !password) {
      return res.status(404).send("erorr while trying to log in");
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ error: "invalid" });
    }
    const token=jwt.sign({ password: password }, JWT_SECRET, {
        expiresIn: 60 * 60,
      });
      return res.status(200).json({ token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const bookISBN = req.params.isbn;
    const userReview = req.query.review;
    const currentUser = req.session.authenticated.username;
    let bookReviews = books[bookISBN].reviews;
    
    let reviewExists = false;
    for (const username in bookReviews) {
      if (username === currentUser) {
        bookReviews[currentUser] = userReview;
        reviewExists = true;
        break;
      }
    }
    if (!reviewExists) {
      bookReviews[currentUser] = userReview;
    }
    
    res.send("added successfully.");
  });
  
  // Delete a book review
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const bookISBN = req.params.isbn;
    const currentUser = req.session.authenticated.username;
    const bookReviews = books[bookISBN].reviews;
    let reviewExists = false;
    for (const username in bookReviews) {
      if (username === currentUser) {
        delete bookReviews[currentUser];
        reviewExists = true;
        break;
      }
    }
    
    if (!reviewExists) {
      res.send("could not be deleted.");
    }
    res.send("deleted successfully.");
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
