if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Campground = require("../models/campground");
const mongoose = require("mongoose");
const { indianCities } = require("./indianCities.js");
const axios = require("axios");
const { descriptors, places } = require("./seedsHelper");
const { imagesSeed } = require("./images");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAP_BOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapboxToken });
const dbUrl = process.env.MONGO_DB_URL;

//  || "mongodb://localhost:27017/yelp-camp";

mongoose
  .connect(dbUrl)
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
  for (let i = 0; i < 50; i++) {
    const random = Math.floor(Math.random() * 1400);
    const price = parseFloat((Math.random() * 40 + 10).toFixed(2));
    const randomImage1 = Math.floor(Math.random() * 50);
    const randomImage2 = Math.floor(Math.random() * 50);
    // const data = await seedImg();
    const location = `${indianCities[random].city}, ${indianCities[random].state}`;

    const geoLocation = await geoCoder
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    const camp = new Campground({
      owner: "61fe8c124238eb266ae70d92",
      location,
      title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
      geometry: geoLocation.body.features[0].geometry,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam ut, aperiam aliquam et, laboriosam praesentium ullam culpa, ipsam atque quas cupiditate cum rerum tenetur delectus! Debitis obcaecati fuga velit? Rerum?",
      price,
      images: [
        {
          url: imagesSeed[randomImage1].url,
          name: imagesSeed[randomImage1].name,
        },
        {
          url: imagesSeed[randomImage2].url,
          name: imagesSeed[randomImage2].name,
        },
      ],
    });
    await camp.save();
  }
};

seedData().then(() => mongoose.connection.close());
