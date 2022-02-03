const express = require("express");
const router = express.Router({ mergeParams: true });
const { catchAsync } = require("../utils/catchAsync");
const { reviewValidation, isLoggedIn, isOwnerReview } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, reviewValidation, catchAsync(reviews.addReview));

router.delete("/:reviewId", isLoggedIn, isOwnerReview, catchAsync(reviews.deleteReview));

module.exports = router;
