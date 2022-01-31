const Campground = require("../models/campground");

//* all campgrounds page
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  delete req.session.lastPage;
  res.render("campgrounds/index", {
    campgrounds,
  });
};

//* create new campground form page
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

//* showing a single campground
module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "owner" } })
    .populate("owner");
  if (!camp) {
    req.flash("error", "Cannot find that campground");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp });
};

//* creating new campground
module.exports.createNewCampground = async (req, res, next) => {
  const newCamp = new Campground(req.body.campground);
  newCamp.owner = req.user._id;
  await newCamp.save();
  req.flash("success", "Successfully created campground");
  res.redirect(`/campgrounds/${newCamp._id}`);
};

//* editing form page of a campground
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "Cannot find that campground");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/update", { camp });
};

//* editing a campground
module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${id}`);
};

//* deleting a campground
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
