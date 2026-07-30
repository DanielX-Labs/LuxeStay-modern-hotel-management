
// const router = require('express').Router();
// const roomImageUpload = require('../middleware/room.image.upload');
// const { isAuthenticatedUser, isAdmin } = require('../middleware/app.authentication');

// const {
//   createRoom, getRoomsList, getRoomByIdOrSlugName, editRoomByAdmin, deleteRoomById, getFeaturedRoomsList
// } = require('../controllers/room.controllers');

// // route for create new room
// router.route('/create-room').post(isAuthenticatedUser, isAdmin, roomImageUpload.array('room_images', 5), createRoom);

// // routes for get all, single and featured rooms list
// router.route('/all-rooms-list').get(getRoomsList);
// router.route('/get-room-by-id-or-slug-name/:id').get(getRoomByIdOrSlugName);
// router.route('/featured-rooms-list').get(getFeaturedRoomsList);

// // routes for edit and delete room by admin
// router.route('/edit-room/:id').put(isAuthenticatedUser, isAdmin, roomImageUpload.array('room_images', 5), editRoomByAdmin);
// router.route('/delete-room/:id').delete(isAuthenticatedUser, isAdmin, deleteRoomById);

// module.exports = router;



const router = require('express').Router();
const roomImageUpload = require('../middleware/room.image.upload'); // Cloudinary version
const { isAuthenticatedUser, isAdmin } = require('../middleware/app.authentication');

const {
  createRoom,
  getRoomsList,
  getRoomByIdOrSlugName,
  editRoomByAdmin,
  deleteRoomById,
  getFeaturedRoomsList
} = require('../controllers/room.controllers');

// ---------------------
// Admin Routes with Cloudinary Upload
// ---------------------

// Create new room (admin) with multiple images
router.route('/create-room').post(
  isAuthenticatedUser,
  isAdmin,
  roomImageUpload.array('room_images', 5), // Cloudinary upload
  createRoom
);

// Edit room (admin) with multiple images
router.route('/edit-room/:id').put(
  isAuthenticatedUser,
  isAdmin,
  roomImageUpload.array('room_images', 5), // Cloudinary upload
  editRoomByAdmin
);

// ---------------------
// Public / Non-upload Routes
// ---------------------

// Get all rooms
router.route('/all-rooms-list').get(getRoomsList);

// Get single room by ID or slug
router.route('/get-room-by-id-or-slug-name/:id').get(getRoomByIdOrSlugName);

// Get featured rooms
router.route('/featured-rooms-list').get(getFeaturedRoomsList);

// Delete room (admin)
router.route('/delete-room/:id').delete(
  isAuthenticatedUser,
  isAdmin,
  deleteRoomById
);

module.exports = router;
