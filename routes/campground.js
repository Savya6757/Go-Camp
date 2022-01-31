const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const { catchAsync } = require("../utils/catchAsync");
const { isLoggedIn, campgroundValidation, isOwner } = require("../middleware");
const campgrounds = require("../controllers/campground");

//* all campgrounds page
router.get("/", catchAsync(campgrounds.index));

//* create new campground form page
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//* showing a single campground
router.get("/:id", catchAsync(campgrounds.showCampground));

//* creating new campground
router.post("/", campgroundValidation, isLoggedIn, catchAsync(campgrounds.createNewCampground));

//* editing form page of a campground
router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(campgrounds.renderEditForm));

//* editing a campground
router.put("/:id", campgroundValidation, isLoggedIn, isOwner, catchAsync(campgrounds.editCampground));

//* deleting a campground
router.delete("/:id", isLoggedIn, isOwner, catchAsync(campgrounds.deleteCampground));

module.exports = router;
