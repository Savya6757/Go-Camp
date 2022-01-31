const ExpressError = require("./utils/ExpressError");
const { validateSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");

//* campgrounds middlewares --------------------------------

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

//* reviews middlewares ----------------------------------------

module.exports.reviewValidation = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
