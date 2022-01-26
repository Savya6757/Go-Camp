const express = require("express");
const app = express();
const path = require("path");
const Campground = require("./models/campground");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Mongo connected");
  })
  .catch((e) => {
    console.log("Mongo Error");
    console.log(e);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/newCamp", async (req, res) => {
  const camp = new Campground({ title: "My BackYard", price: "39.99" });
  await camp.save();
  res.send(camp);
});

app.listen(3000, () => {
  console.log("Listening to port 3000 !!");
});
