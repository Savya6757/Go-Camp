const express = require("express");
const app = express();
const path = require("path");
const Campground = require("./models/campground");
const ejsMethod = require("ejs-mate");
const { validateSchema } = require("./schemas");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const { catchAsync } = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const campground = require("./models/campground");
const { title } = require("process");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Mongo connected");
  })
  .catch((e) => {
    console.log("Mongo Error");
    console.log(e);
  });

app.engine("ejs", ejsMethod);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

function campgroundValidation(req, res, next) {
  const { error } = validateSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  res.render("campgrounds/home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/update", { camp });
  })
);

app.put(
  "/campgrounds/:id",
  campgroundValidation,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
  })
);

app.post(
  "/campgrounds",
  campgroundValidation,
  catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/show", { camp });
  })
);

app.all("*", (req, res, next) => {
  return next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oops Something Went Wrong";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Listening to port 3000 !!");
});
