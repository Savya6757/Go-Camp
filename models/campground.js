const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const mongoosePaginate = require("mongoose-paginate-v2");

const imageSchema = new Schema({
  url: String,
  name: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
imageSchema.virtual("optimised").get(function () {
  return this.url.replace("/upload", "/upload/q_60");
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
  {
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
  },
  opts
);

campgroundSchema.virtual("properties.popupMarkup").get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

campgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground) {
    if (campground.reviews.length) {
      await Review.deleteMany({ _id: { $in: campground.reviews } });
    }
  }
});

campgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", campgroundSchema);
