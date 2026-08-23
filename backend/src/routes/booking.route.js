const router = require('express').Router();
const { isAuthenticatedUser, isBlocked, isAdmin } = require('../middleware/app.authentication');
const {
  placedBookingOrder, getBookingOrderByUserId, cancelSelfBookingOrder, getBookingOrderForAdmin,
  updatedBookingOrderByAdmin, checkRoomAvailability, getBookingDetails, openInvoice,
  resendInvoice, cancelBookingByAdmin
} = require('../controllers/booking.controllers');

// route for placed a room booking order
router.route('/placed-booking-order/:id').post(isAuthenticatedUser, isBlocked, placedBookingOrder);
router.route('/rooms/:id/availability').get(checkRoomAvailability);

// routes for a user get bookings list and cancel booking order
router.route('/get-user-booking-orders').get(isAuthenticatedUser, isBlocked, getBookingOrderByUserId);
router.route('/cancel-booking-order/:id').put(isAuthenticatedUser, isBlocked, cancelSelfBookingOrder);
router.route('/booking/:id').get(isAuthenticatedUser, isBlocked, getBookingDetails);
router.route('/booking/:id/invoice').get(isAuthenticatedUser, isBlocked, openInvoice);

// routes for admin get all bookings list, rejected, approved and checkout placed order
router.route('/get-all-booking-orders').get(isAuthenticatedUser, isBlocked, isAdmin, getBookingOrderForAdmin);
router.route('/updated-booking-order/:id').put(isAuthenticatedUser, isBlocked, isAdmin, updatedBookingOrderByAdmin);
router.route('/admin/booking/:id/cancel').put(isAuthenticatedUser, isBlocked, isAdmin, cancelBookingByAdmin);
router.route('/admin/booking/:id/resend-invoice').post(isAuthenticatedUser, isBlocked, isAdmin, resendInvoice);

module.exports = router;
