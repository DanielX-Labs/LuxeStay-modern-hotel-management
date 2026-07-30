// config/cloudinary.js
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config(); // Load environment variables

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // e.g. 'my-cloud'
  api_key: process.env.CLOUDINARY_API_KEY,       // e.g. '1234567890'
  api_secret: process.env.CLOUDINARY_API_SECRET, // e.g. 'abcdefg12345'
  secure: true
});

module.exports = cloudinary;
