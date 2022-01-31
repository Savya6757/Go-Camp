const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/catchAsync");
const { isLoggedIn, campgroundValidation, isOwner } = require("../middleware");
const campgrounds = require("../controllers/campground");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(campgroundValidation, isLoggedIn, catchAsync(campgrounds.createNewCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(campgroundValidation, isLoggedIn, isOwner, catchAsync(campgrounds.editCampground))
  .delete(isLoggedIn, isOwner, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(campgrounds.renderEditForm));

module.exports = router;
