const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

const imageSchema = new Schema({
  url: String,
  name: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const campgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: Number,
  description: String,
  location: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

campgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground) {
    if (campground.reviews.length) {
      await Review.deleteMany({ _id: { $in: campground.reviews } });
    }
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
