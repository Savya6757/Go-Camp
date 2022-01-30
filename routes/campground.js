const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const { catchAsync } = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { validateSchema } = require("../schemas");

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

router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/update", {
      camp,
    });
  })
);

router.put(
  "/:id",
  campgroundValidation,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${id}`);
  })
);

router.post(
  "/",
  campgroundValidation,
  catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { camp });
  })
);

module.exports = router;
