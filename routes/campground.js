const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const { catchAsync } = require("../utils/catchAsync");
const { isLoggedIn, campgroundValidation, isOwner } = require("../middleware");

//* all campgrounds page
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    delete req.session.lastPage;
    res.render("campgrounds/index", {
      campgrounds,
    });
  })
);

//* create new campground form page
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

//* showing a single campground
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("reviews").populate("owner");
    if (!camp) {
      req.flash("error", "Cannot find that campground");
      res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { camp });
  })
);

//* creating new campground
router.post(
  "/",
  campgroundValidation,
  isLoggedIn,
  catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.owner = req.user._id;
    await newCamp.save();
    req.flash("success", "Successfully created campground");
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

//* editing form page of a campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
      req.flash("error", "Cannot find that campground");
      res.redirect("/campgrounds");
    }
    res.render("campgrounds/update", { camp });
  })
);

//* editing a campground
router.put(
  "/:id",
  campgroundValidation,
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
  })
);

//* deleting a campground
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
