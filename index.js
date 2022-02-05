if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMethod = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const favicon = require("serve-favicon");

const campgroundRoute = require("./routes/campground");
const reviewsRoute = require("./routes/reviews");
const userRoute = require("./routes/users");

//

const dbUrl = process.env.MONGO_DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose
  .connect(dbUrl)
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

app.use(favicon(path.join(__dirname, "public", "fevicon", "favicon.ico")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "changethislater",
  },
});

store.on("error", function (e) {
  console.log("Session Error!!", e);
});

const secret = process.env.SECRET || "changethislater";

const sessionConfig = {
  store,
  name: "yelpSession",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/",
  "https://kit.fontawesome.com/",
  "*.fontawesome.com",
  "https://unpkg.com",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/",
  "https://cdnjs.cloudflare.com/",
  "https://kit.fontawesome.com/",
  "*.fontawesome.com/",
  "https://unpkg.com",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dv5vm4sqh/",
  "*.fontawesome.com/",
];
const fontSrcUrls = ["*.fontawesome.com/"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dqtx8kikg/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
      childSrc: ["blob:"],
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeuser", async (req, res) => {
  const user = new User({ email: "abc@gmail.com", username: "abc" });
  const userRegister = await User.register(user, "abc");
  res.send(userRegister);
});

app.use("/", userRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewsRoute);

app.get("/", (req, res) => {
  res.render("campgrounds/home");
});

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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
