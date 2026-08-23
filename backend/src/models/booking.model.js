const mongoose = require('mongoose');
const { validateBookingDates } = require('../lib/booking.dates.validator');

const bookingSchema = new mongoose.Schema({
  booking_id: {
    type: String, unique: true, sparse: true, index: true
  },
  invoice_id: { type: String, unique: true, sparse: true },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rooms',
    required: [true, 'Room id is required field']
  },
  booking_dates: {
    type: [Date],
    required: [true, 'Booking `booking_dates` is required field'],
    validate: [validateBookingDates, 'Please provide valid future dates for `booking_dates`']
  },
  check_in: { type: Date },
  check_out: { type: Date },
  number_of_nights: { type: Number, min: 1 },
  room_rate: { type: Number, min: 0 },
  total_amount: { type: Number, min: 0 },
  payment_method: { type: String, enum: ['pay_at_hotel'], default: 'pay_at_hotel' },
  payment_status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  invoice_url: String,
  invoice_public_id: String,
  invoice_generated_at: Date,
  cancellation_reason: String,
  cancelled_at: Date,
  cancelled_by: { type: String, enum: ['client', 'admin'] },
  booking_status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'cancel', 'approved', 'rejected', 'in-reviews', 'completed'],
    required: [true, 'Room status is required field.']
  },
  booking_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'User id is required field']
  },
  reviews: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reviews'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// updatedAt' field before saving or updating a document
bookingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Bookings', bookingSchema);
