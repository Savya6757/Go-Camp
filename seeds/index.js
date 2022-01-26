const Campground = require("../models/campground");
const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedsHelper");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Mongo connected");
  })
  .catch((e) => {
    console.log("Mongo Error");
    console.log(e);
  });

const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

const seedData = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      location: `${cities[random].city}, ${cities[random].state}`,
      title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
    });
    await camp.save();
  }
};

seedData().then(() => mongoose.connection.close());
