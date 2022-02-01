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
  if (!campground.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission !");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isOwnerReview = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission !");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
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
  if (req.files.length > 3) {
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
