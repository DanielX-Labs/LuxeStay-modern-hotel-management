
// const router = require('express').Router();
// const {
//   getUser, updateUser, deleteUser, avatarUpdate, getUsersList, blockedUser, unblockedUser, getUserById, deleteUserById
// } = require('../controllers/user.controllers');
// const { isAuthenticatedUser, isAdmin, isBlocked } = require('../middleware/app.authentication');
// const avatarUpload = require('../middleware/user.avatar.upload');

// // get user info route
// router.route('/get-user').get(isAuthenticatedUser, isBlocked, getUser);
// router.route('/get-user/:id').get(isAuthenticatedUser, isBlocked, isAdmin, getUserById);

// // update user info route
// router.route('/update-user').put(isAuthenticatedUser, isBlocked, updateUser);

// // user profile image/avatar update
// router.route('/avatar-update').put(isAuthenticatedUser, isBlocked, avatarUpload.single('avatar'), avatarUpdate);

// // delete user route
// router.route('/delete-user').delete(isAuthenticatedUser, isBlocked, deleteUser);
// router.route('/delete-user/:id').delete(isAuthenticatedUser, isBlocked, isAdmin, deleteUserById);

// // get all users list for admin
// router.route('/all-users-list').get(isAuthenticatedUser, isBlocked, isAdmin, getUsersList);

// // blocked/unblocked user using id by admin
// router.route('/blocked-user/:id').put(isAuthenticatedUser, isBlocked, isAdmin, blockedUser);
// router.route('/unblocked-user/:id').put(isAuthenticatedUser, isBlocked, isAdmin, unblockedUser);

// module.exports = router;









const router = require('express').Router();
const {
  getUser,
  updateUser,
  deleteUser,
  avatarUpdate,
  getUsersList,
  blockedUser,
  unblockedUser,
  getUserById,
  deleteUserById
} = require('../controllers/user.controllers');

const { isAuthenticatedUser, isAdmin, isBlocked } = require('../middleware/app.authentication');
const avatarUpload = require('../middleware/user.avatar.upload'); // Cloudinary version

// ==========================
// User Info Routes
// ==========================

// Get current user info
router.route('/get-user')
  .get(isAuthenticatedUser, isBlocked, getUser);

// Get user info by ID (admin only)
router.route('/get-user/:id')
  .get(isAuthenticatedUser, isBlocked, isAdmin, getUserById);

// ==========================
// User Update Routes
// ==========================

// Update current user info
router.route('/update-user')
  .put(isAuthenticatedUser, isBlocked, updateUser);

// Update user avatar/profile image
router.route('/avatar-update')
  .put(
    isAuthenticatedUser,
    isBlocked,
    avatarUpload.single('avatar'), // Cloudinary middleware
    avatarUpdate
  );

// ==========================
// User Delete Routes
// ==========================

// Delete current user
router.route('/delete-user')
  .delete(isAuthenticatedUser, isBlocked, deleteUser);

// Delete user by ID (admin only)
router.route('/delete-user/:id')
  .delete(isAuthenticatedUser, isBlocked, isAdmin, deleteUserById);

// ==========================
// Admin: Users Management
// ==========================

// Get all users (admin only)
router.route('/all-users-list')
  .get(isAuthenticatedUser, isBlocked, isAdmin, getUsersList);

// Block / unblock user by ID (admin only)
router.route('/blocked-user/:id')
  .put(isAuthenticatedUser, isBlocked, isAdmin, blockedUser);

router.route('/unblocked-user/:id')
  .put(isAuthenticatedUser, isBlocked, isAdmin, unblockedUser);

module.exports = router;
