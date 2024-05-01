const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is Required']
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
    match: [/^\+(?:[0-9] ?){6,14}[0-9]$/, 'Please Enter valid phone number with country code'],
    required: [true, 'Phone Number is Required'],
    unique: [true, 'Phone Number already exists']
  },
  password: {
    type: String,
    required: [true, 'Password is Required']
  },
  about: {
    type: String
  },
  profileImg: {
    type: String
  },
  drivingLicenseInfo: {
    type: Object
  },
  verifiedId: {
    type: Object
  },
  otp: {
    type: String,
  },
  communities: {
    type: Array
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
