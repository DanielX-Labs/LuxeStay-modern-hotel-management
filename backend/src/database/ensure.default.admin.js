const User = require('../models/user.model');
const logger = require('../middleware/winston.logger');

let bootstrapPromise;

const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not configured; default admin was not created');
    return null;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        if (existingUser.role !== 'admin') {
          existingUser.role = 'admin';
          existingUser.verified = true;
          await existingUser.save({ validateBeforeSave: false });
          logger.info(`Promoted configured account to admin: ${email}`);
        }
        return existingUser;
      }

      const admin = await User.create({
        userName: 'luxe-stay-admin',
        fullName: 'LuxeStay Administrator',
        email,
        password,
        dob: new Date('2000-01-01'),
        address: 'LuxeStay Administration',
        role: 'admin',
        verified: false,
        status: 'register'
      });

      logger.info(`Created default admin account: ${email}`);
      return admin;
    })().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }

  return bootstrapPromise;
};

module.exports = ensureDefaultAdmin;