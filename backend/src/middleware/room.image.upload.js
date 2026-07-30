
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadPath = () => {
//   const UPLOADS_FOLDER = './public/uploads/rooms';

//   // if not exists to `upload` folder to create
//   if (!fs.existsSync('./public/uploads')) {
//     fs.mkdirSync('./public/uploads', { recursive: true });
//   }

//   // if not exists to `rooms` folder to create
//   if (!fs.existsSync(UPLOADS_FOLDER)) {
//     fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
//   }

//   return UPLOADS_FOLDER;
// };

// // define the storage
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadPath());
//   },
//   filename: (req, file, cb) => {
//     const fileExt = path.extname(file.originalname);
//     const fileName = `${file.originalname.replace(fileExt, '').toLowerCase().split(' ').join('-')}-${Date.now()}`;

//     cb(null, fileName + fileExt);
//   }
// });

// // prepare the final multer upload object
// const roomImageUpload = multer({
//   storage,
//   limits: {
//     fileSize: 1000000 // 1MB
//   },
//   fileFilter: (_req, files, cb) => {
//     if (files.fieldname === 'room_images') {
//       if (files.mimetype === 'image/png' || files.mimetype === 'image/jpg' || files.mimetype === 'image/jpeg') {
//         cb(null, true);
//       } else {
//         cb(new Error('Only .jpg, .png or .jpeg format allowed!'));
//       }
//     } else {
//       cb(new Error('There was an unknown error!'));
//     }
//   }
// });

// module.exports = roomImageUpload;




// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../config/cloudinary');

// // Configure Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'rooms', // Cloudinary folder
//     format: async (req, file) => 'jpg', // convert all images to jpg
//     public_id: (req, file) =>
//       `${file.originalname.replace(/\.[^/.]+$/, '').toLowerCase().split(' ').join('-')}-${Date.now()}`,
//   },
// });

// // Multer upload instance
// const roomImageUpload = multer({
//   storage,
//   limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
//   fileFilter: (_req, file, cb) => {
//     const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
//     if (!allowedTypes.includes(file.mimetype)) return cb(new Error('Only .jpg, .png or .jpeg allowed'));
//     cb(null, true);
//   },
// });

// module.exports = roomImageUpload;











const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryModule = require('cloudinary');

// === Cloudinary Config ===
const cloudinary = cloudinaryModule.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === Cloudinary Storage ===
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rooms',
    format: async () => 'jpg', // Convert all uploaded images to JPG
    public_id: (req, file) =>
      `${file.originalname.replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .split(' ')
        .join('-')}-${Date.now()}`,
  },
});

// ❌ Blocked types
const blockedTypes = [
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/tif',
  'image/heic',
  'image/heif',
  'image/jfif' // new addition
];

// === Multer Upload ===
const roomImageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (blockedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'GIF, SVG, BMP, TIFF, HEIC, JFIF files are not allowed. Please upload JPG, PNG, WEBP, or AVIF.'
        )
      );
    }
    cb(null, true);
  },
});

module.exports = roomImageUpload;



















