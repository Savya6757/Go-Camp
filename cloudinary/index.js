const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg"],
    limits: { fileSize: 500000 },
  },
});

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024,
//   },
// }).single("file");

module.exports = {
  cloudinary,
  storage,
};
