const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn , isreviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")

// Middleware to validate review data
const validateReview = (req, res, next) => {
    // Your validation logic goes here
    // Make sure to validate the review data using a schema
    next(); // Proceed to the next middleware or route handler
};

// Route to add a new review to a listing
router.post("/:id/reviews", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Route to delete a review from a listing
router.delete("/:id/reviews/:reviewId",
isLoggedIn,
isreviewAuthor,
 wrapAsync(reviewController.deleteReview));

module.exports = router;
