const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name is Required']
  },
  lastName: {
    type: String
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
  otp: {
    type: String,
  },
}, { timestamps: true });

const TempUser = mongoose.model('tempUser', tempUserSchema);

module.exports = TempUser;
