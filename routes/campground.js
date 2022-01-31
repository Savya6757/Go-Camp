const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const { catchAsync } = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { validateSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");

function campgroundValidation(req, res, next) {
  const { error } = validateSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {
      campgrounds,
    });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

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

router.get(
  "/:id/edit",
  isLoggedIn,
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

router.put(
  "/:id",
  campgroundValidation,
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  })
);

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

module.exports = router;
