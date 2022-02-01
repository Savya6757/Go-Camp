const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");

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
  newCamp.images = req.files.map((file) => ({ url: file.path, name: file.filename }));
  if (newCamp.images.length > 2) {
    req.flash("Error", "Too many files");
    return res.redirect(`/campgrounds/${newCamp._id}`);
  }
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
  const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map((f) => ({ url: f.path, name: f.filename }));
  camp.images.push(...imgs);
  await camp.save();
  if (req.body.deleteImages) {
    for (imgsName of req.body.deleteImages) {
      await cloudinary.uploader.destroy(imgsName);
    }
    await camp.updateOne({ $pull: { images: { name: { $in: req.body.deleteImages } } } });
  }
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${id}`);
};

//* deleting a campground
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const deletedCamp = await Campground.findByIdAndDelete(id);
  if (deletedCamp) {
    for (imgsName of deletedCamp.images) {
      await cloudinary.uploader.destroy(imgsName.name);
    }
  }
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
