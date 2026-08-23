
// const fs = require('fs');
// const appRoot = require('app-root-path');
// const Room = require('../models/room.model');
// const logger = require('../middleware/winston.logger');
// const { errorResponse, successResponse } = require('../configs/app.response');
// const MyQueryHelper = require('../configs/api.feature');

// // TODO: Controller for create new room
// exports.createRoom = async (req, res) => {
//   try {
//     const {
//       room_name, room_slug, room_type, room_price, room_size, room_capacity, allow_pets, provide_breakfast, featured_room, room_description, extra_facilities
//     } = req.body;

//     // check `room_name` filed exits
//     if (!room_name) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_name` filed is required'
//       ));
//     }

//     // check `room_slug` filed exits
//     if (!room_slug) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_slug` filed is required'
//       ));
//     }

//     // check `room_type` filed exits
//     if (!room_type) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_type` filed is required'
//       ));
//     }

//     // check `room_price` filed exits
//     if (!room_price) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_price` filed is required'
//       ));
//     }

//     // check `room_size` filed exits
//     if (!room_size) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_size` filed is required'
//       ));
//     }

//     // check `room_capacity` filed exits
//     if (!room_capacity) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_capacity` filed is required'
//       ));
//     }

//     // check `room_description` filed exits
//     if (!room_description) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_description` filed is required'
//       ));
//     }

//     // check `extra_facilities[0]` filed exits
//     if (!extra_facilities[0]) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         'Minimum 1 `extra_facilities` filed is required'
//       ));
//     }

//     // check `req.files[0]` filed exits
//     if (!req.files[0]) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         'Minimum 1 `room_images` filed is required '
//       ));
//     }

//     // check `room_name` already exist in database
//     const roomName = await Room.findOne({ room_name });
//     if (roomName) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(409).json(errorResponse(
//         9,
//         'ALREADY EXIST',
//         'Sorry, `room_name` already exists'
//       ));
//     }

//     // check `room_slug` already exist in database
//     const roomSlug = await Room.findOne({ room_slug });
//     if (roomSlug) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(409).json(errorResponse(
//         9,
//         'ALREADY EXIST',
//         'Sorry, `room_slug` already exists'
//       ));
//     }

//     // prepared user input room data to store database
//     const data = {
//       room_name,
//       room_slug,
//       room_type,
//       room_price,
//       room_size,
//       room_capacity,
//       allow_pets,
//       provide_breakfast,
//       featured_room,
//       room_description,
//       extra_facilities,
//       room_images: req?.files?.map((file) => ({ url: `/uploads/rooms/${file.filename}` })),
//       created_by: req.user.id
//     };

//     // save room data in database
//     const room = await Room.create(data);

//     // success response with register new user
//     res.status(201).json(successResponse(
//       0,
//       'SUCCESS',
//       'New room create successful',
//       room
//     ));
//   } catch (error) {
//     for (const element of req.files) {
//       fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//         if (err) { logger.error(err); }
//       });
//     }

//     res.status(500).json(errorResponse(
//       2,
//       'SERVER SIDE ERROR',
//       error
//     ));
//   }
// };

// // TODO: Controller for get all rooms list
// exports.getRoomsList = async (req, res) => {
//   try {
//     // finding all room data from database
//     const rooms = await Room.find();

//     // filtering rooms based on different types query
//     const roomQuery = new MyQueryHelper(Room.find(), req.query).search('room_name').sort().paginate();
//     const findRooms = await roomQuery.query;

//     const mappedRooms = findRooms?.map((data) => ({
//       id: data._id,
//       room_name: data.room_name,
//       room_slug: data.room_slug,
//       room_type: data.room_type,
//       room_price: data.room_price,
//       room_size: data.room_size,
//       room_capacity: data.room_capacity,
//       allow_pets: data.allow_pets,
//       provide_breakfast: data.provide_breakfast,
//       featured_room: data.featured_room,
//       room_description: data.room_description,
//       room_status: data.room_status,
//       extra_facilities: data.extra_facilities,
//       room_images: data?.room_images?.map(
//         (img) => ({ url: process.env.API_URL + img.url })
//       ),
//       created_by: data.created_by,
//       created_at: data.createdAt,
//       updated_at: data.updatedAt
//     }));

//     res.status(200).json(successResponse(
//       0,
//       'SUCCESS',
//       'Rooms list data found successful',
//       {
//         rows: mappedRooms,
//         total_rows: rooms.length,
//         response_rows: findRooms.length,
//         total_page: req?.query?.keyword ? Math.ceil(findRooms.length / req.query.limit) : Math.ceil(rooms.length / req.query.limit),
//         current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
//       }
//     ));
//   } catch (error) {
//     res.status(500).json(errorResponse(
//       2,
//       'SERVER SIDE ERROR',
//       error
//     ));
//   }
// };

// // TODO: Controller for find a room by id or room slug_name
// exports.getRoomByIdOrSlugName = async (req, res) => {
//   try {
//     let room = null;

//     if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
//       room = await Room.findById(req.params.id).populate('created_by');
//     } else {
//       room = await Room.findOne({ room_slug: req.params.id }).populate('created_by');
//     }

//     if (!room) {
//       return res.status(404).json(errorResponse(
//         4,
//         'UNKNOWN ACCESS',
//         'Room does not exist'
//       ));
//     }

//     const organizedRoom = {
//       id: room?._id,
//       room_name: room?.room_name,
//       room_slug: room?.room_slug,
//       room_type: room?.room_type,
//       room_price: room?.room_price,
//       room_size: room?.room_size,
//       room_capacity: room?.room_capacity,
//       allow_pets: room?.allow_pets,
//       provide_breakfast: room?.provide_breakfast,
//       featured_room: room?.featured_room,
//       room_description: room?.room_description,
//       room_status: room?.room_status,
//       extra_facilities: room?.extra_facilities,
//       room_images: room?.room_images?.map(
//         (img) => ({ url: process.env.API_URL + img.url })
//       ),
//       created_by: {
//         id: room?.created_by._id,
//         userName: room?.created_by.userName,
//         fullName: room?.created_by.fullName,
//         email: room?.created_by.email,
//         phone: room?.created_by.phone,
//         avatar: process.env.API_URL + room?.created_by.avatar,
//         gender: room?.created_by.gender,
//         dob: room?.created_by.dob,
//         address: room?.created_by.address,
//         role: room?.created_by.role,
//         verified: room?.created_by.verified,
//         status: room?.created_by.status,
//         createdAt: room?.created_by.createdAt,
//         updatedAt: room?.created_by.updatedAt
//       },
//       created_at: room?.createdAt,
//       updated_at: room?.updatedAt
//     };

//     res.status(200).json(successResponse(
//       0,
//       'SUCCESS',
//       'User information get successful',
//       organizedRoom
//     ));
//   } catch (error) {
//     res.status(500).json(errorResponse(
//       2,
//       'SERVER SIDE ERROR',
//       error
//     ));
//   }
// };

// // TODO: Controller for edit room
// exports.editRoomByAdmin = async (req, res) => {
//   try {
//     const {
//       room_name, room_slug, room_type, room_price, room_size, room_capacity, allow_pets, provide_breakfast, featured_room, room_description, extra_facilities
//     } = req.body;

//     // check `room_name` filed exits
//     if (!room_name) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_name` filed is required '
//       ));
//     }

//     // check `room_slug` filed exits
//     if (!room_slug) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_slug` filed is required '
//       ));
//     }

//     // check `room_type` filed exits
//     if (!room_type) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_type` filed is required '
//       ));
//     }

//     // check `room_price` filed exits
//     if (!room_price) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_price` filed is required '
//       ));
//     }

//     // check `room_size` filed exits
//     if (!room_size) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_size` filed is required '
//       ));
//     }

//     // check `room_capacity` filed exits
//     if (!room_capacity) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_capacity` filed is required '
//       ));
//     }

//     // check `room_description` filed exits
//     if (!room_description) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         '`room_description` filed is required '
//       ));
//     }

//     // check `extra_facilities[0]` filed exits
//     if (!extra_facilities[0]) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         'Minimum 1 `extra_facilities` filed is required '
//       ));
//     }

//     // check `req.files[0]` filed exits
//     if (!req.files[0]) {
//       for (const element of req.files) {
//         fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//       return res.status(400).json(errorResponse(
//         1,
//         'FAILED',
//         'Minimum 1 `room_images` filed is required '
//       ));
//     }

//     // finding by room by room id
//     let room = null;

//     if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
//       room = await Room.findById(req.params.id);
//     }

//     if (!room) {
//       return res.status(404).json(errorResponse(
//         4,
//         'UNKNOWN ACCESS',
//         'Room does not exist'
//       ));
//     }

//     // delete room old images
//     (() => {
//       for (const element of room.room_images) {
//         fs.unlink(`${appRoot}/public/${element.url}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//     })();

//     // update room info & save database
//     const updatedRoom = await Room.findByIdAndUpdate(
//       req.params.id,
//       {
//         room_name,
//         room_slug,
//         room_type,
//         room_price,
//         room_size,
//         room_capacity,
//         allow_pets,
//         provide_breakfast,
//         featured_room,
//         room_description,
//         extra_facilities,
//         room_images: req?.files?.map(
//           (file) => ({ url: `/uploads/rooms/${file.filename}` })
//         ),
//         updatedAt: Date.now()
//       },
//       { runValidators: true, new: true }
//     );

//     // success response with register new user
//     res.status(201).json(successResponse(
//       0,
//       'SUCCESS',
//       'New room updated successful',
//       updatedRoom
//     ));
//   } catch (error) {
//     for (const element of req.files) {
//       fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
//         if (err) { logger.error(err); }
//       });
//     }

//     res.status(500).json(errorResponse(
//       2,
//       'SERVER SIDE ERROR',
//       error
//     ));
//   }
// };

// // TODO: Controller for delete room using ID by admin
// exports.deleteRoomById = async (req, res) => {
//   try {
//     // check if room exists
//     const room = await Room.findById(req.params.id);

//     if (!room) {
//       return res.status(404).json(errorResponse(
//         4,
//         'UNKNOWN ACCESS',
//         'Room does not exist'
//       ));
//     }

//     // delete room form database
//     await Room.findByIdAndDelete(room.id);

//     // delete old images
//     (() => {
//       for (const element of room.room_images) {
//         fs.unlink(`${appRoot}/public/${element.url}`, (err) => {
//           if (err) { logger.error(err); }
//         });
//       }
//     })();

//     res.status(200).json(successResponse(
//       0,
//       'SUCCESS',
//       'Room delete form database successful'
//     ));
//   } catch (error) {
//     res.status(500).json(errorResponse(
//       2,
//       'SERVER SIDE ERROR',
//       error
//     ));
//   }
// };

// // TODO: Controller for get featured rooms list
// exports.getFeaturedRoomsList = async (req, res) => {
//   try {
//     // finding featured room data from database
//     const rooms = await Room.find({ featured_room: true });

//     // filtering rooms based on different types query
//     const roomQuery = new MyQueryHelper(Room.find(
//       { featured_room: true }
//     ), req.query).search('room_name').sort().paginate();
//     const findRooms = await roomQuery.query;

//     const mappedRooms = findRooms?.map((data) => ({
//       id: data._id,
//       room_name: data.room_name,
//       room_slug: data.room_slug,
//       room_type: data.room_type,
//       room_price: data.room_price,
//       room_size: data.room_size,
//       room_capacity: data.room_capacity,
//       allow_pets: data.allow_pets,
//       provide_breakfast: data.provide_breakfast,
//       featured_room: data.featured_room,
//       room_description: data.room_description,
//       room_status: data.room_status,
//       extra_facilities: data.extra_facilities,
//       room_images: data?.room_images?.map(
//         (img) => ({ url: process.env.API_URL + img.url })
//       ),
//       created_by: data.created_by,
//       created_at: data.createdAt,
//       updated_at: data.updatedAt
//     }));

//     res.status(200).json(successResponse(
//       0,
//       'SUCCESS',
//       'Featured rooms list data found successful',
//       {
//         rows: mappedRooms,
//         total_rows: rooms.length,
//         response_rows: findRooms.length,
//         total_page: req?.query?.keyword ? Math.ceil(findRooms.length / req.query.limit) : Math.ceil(rooms.length / req.query.limit),
//         current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
//       }
//     ));
//   } catch (error) {
//     res.status(500).json(errorResponse(
//       2,
//       'SERVER SIDE ERROR',
//       error
//     ));
//   }
// };


































const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const logger = require('../middleware/winston.logger');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');
const cloudinary = require('../configs/cloudinary'); // Cloudinary config
const { v2: cloudinaryV2 } = require('cloudinary');

// TODO: Controller for create new room
exports.createRoom = async (req, res) => {
  try {
    const {
      room_name,
      room_slug,
      room_type,
      room_price,
      room_size,
      room_capacity,
      allow_pets,
      provide_breakfast,
      featured_room,
      room_description,
      extra_facilities
    } = req.body;

    // check `room_name` field exists
    if (!room_name) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_name` field is required'
      ));
    }

    // check `room_slug` field exists
    if (!room_slug) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_slug` field is required'
      ));
    }

    // check `room_type` field exists
    if (!room_type) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_type` field is required'
      ));
    }

    // check `room_price` field exists
    if (!room_price) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_price` field is required'
      ));
    }

    // check `room_size` field exists
    if (!room_size) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_size` field is required'
      ));
    }

    // check `room_capacity` field exists
    if (!room_capacity) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_capacity` field is required'
      ));
    }

    // check `room_description` field exists
    if (!room_description) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        '`room_description` field is required'
      ));
    }

    // check `extra_facilities[0]` field exists
    if (!extra_facilities || !extra_facilities[0]) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Minimum 1 `extra_facilities` field is required'
      ));
    }

    // check `req.files[0]` field exists
    if (!req.files || !req.files[0]) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Minimum 1 `room_images` field is required'
      ));
    }

    // check `room_name` already exist in database
    const roomName = await Room.findOne({ room_name });
    if (roomName) {
      return res.status(409).json(errorResponse(
        9,
        'ALREADY EXIST',
        'Sorry, `room_name` already exists'
      ));
    }

    // check `room_slug` already exist in database
    const roomSlug = await Room.findOne({ room_slug });
    if (roomSlug) {
      return res.status(409).json(errorResponse(
        9,
        'ALREADY EXIST',
        'Sorry, `room_slug` already exists'
      ));
    }

    // Upload images to Cloudinary
    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename
    }));

    // prepared room data to store database
    const data = {
      room_name,
      room_slug,
      room_type,
      room_price,
      room_size,
      room_capacity,
      allow_pets,
      provide_breakfast,
      featured_room,
      room_description,
      extra_facilities,
      room_images: uploadedImages,
      created_by: req.user.id
    };

    // save room data in database
    const room = await Room.create(data);

    // success response
    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'New room created successfully',
      room
    ));
  } catch (error) {
    // Log error and respond
    logger.error(error);
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error.message
    ));
  }
};

// TODO: Controller for get all rooms list
exports.getRoomsList = async (req, res) => {
  try {
    const checkIn = new Date(req.query.check_in || req.query.checkIn);
    const checkOut = new Date(req.query.check_out || req.query.checkOut);
    const filter = {};
    if (!Number.isNaN(checkIn.getTime()) && !Number.isNaN(checkOut.getTime()) && checkOut > checkIn) {
      const reservedRoomIds = await Booking.distinct('room_id', {
        booking_status: { $in: ['pending', 'confirmed', 'checked_in', 'approved'] },
        $or: [
          { check_in: { $lt: checkOut }, check_out: { $gt: checkIn } },
          { check_in: { $exists: false }, booking_dates: { $elemMatch: { $gte: checkIn, $lt: checkOut } } }
        ]
      });
      filter._id = { $nin: reservedRoomIds };
      filter.room_status = { $ne: 'unavailable' };
    }
    const rooms = await Room.find(filter);
    const roomQuery = new MyQueryHelper(Room.find(filter), req.query).search('room_name').sort().paginate();
    const findRooms = await roomQuery.query;

    const mappedRooms = findRooms?.map(data => ({
      id: data._id,
      room_name: data.room_name,
      room_slug: data.room_slug,
      room_type: data.room_type,
      room_price: data.room_price,
      room_size: data.room_size,
      room_capacity: data.room_capacity,
      allow_pets: data.allow_pets,
      provide_breakfast: data.provide_breakfast,
      featured_room: data.featured_room,
      room_description: data.room_description,
      room_status: data.room_status,
      extra_facilities: data.extra_facilities,
      room_images: data?.room_images,
      created_by: data.created_by,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    }));

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Rooms list data retrieved successfully',
      {
        rows: mappedRooms,
        total_rows: rooms.length,
        response_rows: findRooms.length,
        total_page: req?.query?.keyword ? Math.ceil(findRooms.length / req.query.limit) : Math.ceil(rooms.length / req.query.limit),
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
      }
    ));
  } catch (error) {
    logger.error(error);
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error.message
    ));
  }
};

// TODO: Controller for get room by id or slug
exports.getRoomByIdOrSlugName = async (req, res) => {
  try {
    let room = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      room = await Room.findById(req.params.id).populate('created_by');
    } else {
      room = await Room.findOne({ room_slug: req.params.id }).populate('created_by');
    }

    if (!room) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    const organizedRoom = {
      id: room._id,
      room_name: room.room_name,
      room_slug: room.room_slug,
      room_type: room.room_type,
      room_price: room.room_price,
      room_size: room.room_size,
      room_capacity: room.room_capacity,
      allow_pets: room.allow_pets,
      provide_breakfast: room.provide_breakfast,
      featured_room: room.featured_room,
      room_description: room.room_description,
      room_status: room.room_status,
      extra_facilities: room.extra_facilities,
      room_images: room.room_images,
      created_by: {
        id: room.created_by._id,
        userName: room.created_by.userName,
        fullName: room.created_by.fullName,
        email: room.created_by.email,
        phone: room.created_by.phone,
        avatar: room.created_by.avatar,
        gender: room.created_by.gender,
        dob: room.created_by.dob,
        address: room.created_by.address,
        role: room.created_by.role,
        verified: room.created_by.verified,
        status: room.created_by.status,
        createdAt: room.created_by.createdAt,
        updatedAt: room.created_by.updatedAt
      },
      created_at: room.createdAt,
      updated_at: room.updatedAt
    };

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Room details retrieved successfully',
      organizedRoom
    ));
  } catch (error) {
    logger.error(error);
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error.message
    ));
  }
};

// TODO: Controller for edit room
exports.editRoomByAdmin = async (req, res) => {
  try {
    const {
      room_name,
      room_slug,
      room_type,
      room_price,
      room_size,
      room_capacity,
      allow_pets,
      provide_breakfast,
      featured_room,
      room_description,
      extra_facilities
    } = req.body;

    // Validation
    const requiredFields = [
      { value: room_name, name: 'room_name' },
      { value: room_slug, name: 'room_slug' },
      { value: room_type, name: 'room_type' },
      { value: room_price, name: 'room_price' },
      { value: room_size, name: 'room_size' },
      { value: room_capacity, name: 'room_capacity' },
      { value: room_description, name: 'room_description' }
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          `\`${field.name}\` field is required`
        ));
      }
    }

    if (!extra_facilities || !extra_facilities[0]) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Minimum 1 `extra_facilities` field is required'
      ));
    }

    if (!req.files || !req.files[0]) {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Minimum 1 `room_images` field is required'
      ));
    }

    // Find room by ID
    let room = null;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      room = await Room.findById(req.params.id);
    }

    if (!room) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    // Delete old images from Cloudinary
    for (const img of room.room_images) {
      if (img.public_id) {
        await cloudinaryV2.uploader.destroy(img.public_id);
      }
    }

    // Upload new images to Cloudinary
    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename
    }));

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        room_name,
        room_slug,
        room_type,
        room_price,
        room_size,
        room_capacity,
        allow_pets,
        provide_breakfast,
        featured_room,
        room_description,
        extra_facilities,
        room_images: uploadedImages,
        updatedAt: Date.now()
      },
      { runValidators: true, new: true }
    );

    res.status(201).json(successResponse(
      0,
      'SUCCESS',
      'Room updated successfully',
      updatedRoom
    ));
  } catch (error) {
    logger.error(error);
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error.message
    ));
  }
};

// TODO: Controller for delete room using ID by admin
exports.deleteRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Room does not exist'
      ));
    }

    // Delete images from Cloudinary
    for (const img of room.room_images) {
      if (img.public_id) {
        await cloudinaryV2.uploader.destroy(img.public_id);
      }
    }

    // Delete room from DB
    await Room.findByIdAndDelete(room.id);

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Room deleted successfully'
    ));
  } catch (error) {
    logger.error(error);
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error.message
    ));
  }
};

// TODO: Controller for get featured rooms list
exports.getFeaturedRoomsList = async (req, res) => {
  try {
    const rooms = await Room.find({ featured_room: true });
    const roomQuery = new MyQueryHelper(Room.find({ featured_room: true }), req.query)
      .search('room_name').sort().paginate();
    const findRooms = await roomQuery.query;

    const mappedRooms = findRooms?.map(data => ({
      id: data._id,
      room_name: data.room_name,
      room_slug: data.room_slug,
      room_type: data.room_type,
      room_price: data.room_price,
      room_size: data.room_size,
      room_capacity: data.room_capacity,
      allow_pets: data.allow_pets,
      provide_breakfast: data.provide_breakfast,
      featured_room: data.featured_room,
      room_description: data.room_description,
      room_status: data.room_status,
      extra_facilities: data.extra_facilities,
      room_images: data.room_images,
      created_by: data.created_by,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    }));

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Featured rooms list retrieved successfully',
      {
        rows: mappedRooms,
        total_rows: rooms.length,
        response_rows: findRooms.length,
        total_page: req?.query?.keyword ? Math.ceil(findRooms.length / req.query.limit) : Math.ceil(rooms.length / req.query.limit),
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
      }
    ));
  } catch (error) {
    logger.error(error);
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error.message
    ));
  }
};
