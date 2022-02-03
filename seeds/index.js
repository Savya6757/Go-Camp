if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Campground = require("../models/campground");
const mongoose = require("mongoose");
const { indianCities } = require("./indianCities.js");
const axios = require("axios");
const { descriptors, places } = require("./seedsHelper");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAP_BOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapboxToken });

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Mongo connected");
  })
  .catch((e) => {
    console.log("Mongo Error");
    console.log(e);
  });

const randomFromArray = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "T4lCgmQnWlBJrOj0SBAVKtxfly-Ru01TlF8XCJzcgiE",
        collections: 9046579,
      },
    });
    data = resp.data.urls.small;
    return data;
  } catch (err) {
    console.error(err);
  }
}

const seedData = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random = Math.floor(Math.random() * 1400);
    const price = parseFloat((Math.random() * 40 + 10).toFixed(2));
    // const data = await seedImg();
    const location = `${indianCities[random].city}, ${indianCities[random].state}`;

    const geoLocation = await geoCoder
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    const camp = new Campground({
      owner: "61fbee34a20af8f54eacd59a",
      location,
      title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
      geometry: geoLocation.body.features[0].geometry,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam ut, aperiam aliquam et, laboriosam praesentium ullam culpa, ipsam atque quas cupiditate cum rerum tenetur delectus! Debitis obcaecati fuga velit? Rerum?",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dqtx8kikg/image/upload/v1643809925/YelpCamp/mainCamp_rvbo8y.jpg",
          name: "YelpCamp/mainCamp_rvbo8y",
        },
        {
          url: "https://res.cloudinary.com/dqtx8kikg/image/upload/v1643811183/YelpCamp/hillsCamp_cuyeoo.jpg",
          name: "YelpCamp/hillsCamp_cuyeoo.jpg",
        },
      ],
    });
    await camp.save();
  }
};

seedData().then(() => mongoose.connection.close());
