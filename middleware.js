const ExpressError = require("./utils/ExpressError");
const { validateSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const Review = require("./models/reviews");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.lastPage = req.originalUrl;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

module.exports.campgroundValidation = (req, res, next) => {
  const { error } = validateSchema.validate(req.body);
  if (isNaN(req.body.campground.price)) {
    req.flash("error", "price must be a number");
    return res.redirect("/campgrounds/new");
  }
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (campground.owner.equals(req.user._id) || req.user.isAdmin) {
    return next();
  } else {
    req.flash("error", "You do not have permission !");
    res.redirect(`/campgrounds/${id}`);
  }
};

module.exports.isOwnerReview = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (review.owner.equals(req.user._id) || req.user.isAdmin) {
    next();
  } else {
    req.flash("error", "You do not have permission !");
    return res.redirect(`/campgrounds/${id}`);
  }
};

module.exports.reviewValidation = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.fileCheck = (req, res, next) => {
  const { id } = req.params;
  if (req.files.length > 5) {
    req.flash("error", "Too many files");
    return res.redirect(`/campgrounds/${id}/edit`);
  }
  let size = 0;
  for (let img of req.files) {
    size += img.size;
  }
  if (size > 5000000) {
    req.flash("error", "Too Large files");
    return res.redirect(`/campgrounds/${id}/edit`);
  }
  next();
};
