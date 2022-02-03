const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAP_BOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapboxToken });
const { cloudinary } = require("../cloudinary/index");

//* all campgrounds page
module.exports.index = async (req, res) => {
  delete req.session.lastPage;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    const campForMap = await Campground.find({ title: regex });
    if (!req.query.page) {
      const campgrounds = await Campground.paginate(
        { title: regex },
        {
          limit: 20,
        }
      );
      console.log(campgrounds.docs);
      if (!campgrounds.docs.length) {
        req.flash("error", "Cannot find that campground");
        res.redirect("/campgrounds");
      } else {
        res.render("campgrounds/index", {
          campgrounds,
          campForMap,
        });
      }
    } else {
      const { page } = req.query;
      const campgrounds = await Campground.paginate({ title: regex }, { page, limit: 20 });
      res.status(200).json(campgrounds);
    }
  } else {
    const campForMap = await Campground.find({});
    if (!req.query.page) {
      const campgrounds = await Campground.paginate({}, { limit: 20 });
      res.render("campgrounds/index", {
        campgrounds,
        campForMap,
      });
    } else {
      const { page } = req.query;
      const campgrounds = await Campground.paginate({}, { page, limit: 20 });
      res.status(200).json(campgrounds);
    }
  }
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
  const geoLocation = await geoCoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const newCamp = new Campground(req.body.campground);
  newCamp.geometry = geoLocation.body.features[0].geometry;
  newCamp.images = req.files.map((file) => ({ url: file.path, name: file.filename }));
  newCamp.images = newCamp.optimised;
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

  const geoLocation = await geoCoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  camp.geometry = geoLocation.body.features[0].geometry;
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

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
