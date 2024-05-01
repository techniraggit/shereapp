const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const TempUser = require('../models/TempUser');
const { sendOtp } = require('../utils/index');

const registerUser = async (req, res) => {
    const { firstName, lastName = '', email = '', password, phoneNumber } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        // Check if user exists
        let tempUser = await TempUser.findOne({ $or: [{ email }, { phoneNumber }] });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        } else if (tempUser) {
            const otp = Math.floor(Math.random() * 900000) + 100000;
            sendOtp(otp, tempUser.phoneNumber);
            tempUser.otp = otp;
            tempUser.save();
            return res.status(200).json({ data: tempUser, message: "OTP Send" })
        } else {
            // Create new user
            user = new TempUser({ firstName, lastName, email, password, phoneNumber });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        const otp = Math.floor(Math.random() * 900000) + 100000;
        sendOtp(otp, user.phoneNumber);
        user.otp = otp;

        // Save user to database
        user.save().then((data) => res.status(200).json({ data, message: 'User created successfully' })).catch((error) => {
            if (error.name === 'ValidationError') {
                let errors = {};

                Object.keys(error.errors).forEach((key) => {
                    errors[key] = error.errors[key].message;
                });

                return res.status(400).send(errors);
            }

            return res.status(500).json({ error: 'Server error' });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const loginUser = async (req, res) => {
    const { phoneNumber, password } = req.body;
    console.log("req.body === ", req.body)

    try {

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Please Enter Phone Number' });
        } else if (!password) {
            return res.status(400).json({ message: 'Please Enter Password' })
        }
        // Check if user exists
        let user = await TempUser.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN, { expiresIn: '2d' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60d' });

        res.json({ user, accessToken, refreshToken, message: 'Login Success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token missing' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Refresh token invalid' });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN, { expiresIn: '2d' });
        const newRefreshToken = jwt.sign({ userId: decoded.userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60d' });

        return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    });
}

const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        // Check if user exists
        let user = await TempUser.findOne({ phoneNumber, otp });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        let originalUser = new User();
        originalUser.firstName = user.firstName;
        if (user?.lastName) {
            originalUser.lastName = user.lastName;
        }
        if (user?.email) {
            originalUser.email = user.email;
        }
        originalUser.phoneNumber = user.phoneNumber;
        originalUser.password = user.password;
        originalUser.save();
        await TempUser.deleteOne({ phoneNumber, otp });
        const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN, { expiresIn: '2d' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60d' });
        res.json({ user: originalUser, accessToken, refreshToken, message: 'OTP Verified Success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const sendAgainOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        // Check if user exists
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Phone Number' });
        }
        const otp = Math.floor(Math.random() * 900000) + 100000;
        sendOtp(otp, user.phoneNumber);
        user.otp = otp;
        user.save();
        res.json({ message: 'OTP Send' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const forgetPassword = async (req, res) => {
    try {
        const { phoneNumber, otp, password } = req.body;
        // Check if user exists
        let user = await User.findOne({ phoneNumber, otp });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.otp = undefined;
        user.save();
        res.status(200).json({ message: 'password changed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const getUserProfile = async (req, res) => {
    try {
        const { id: userId } = req.params;
        // Check if user exists
        let user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!user) {
            return res.status(400).json({ message: 'User does not exists' });
        }

        return res.json({ user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { id: userId, about, drivingLicenseInfo, verifiedId, firstName, lastName, profileImg } = req.body;
        // Check if user exists
        let user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!user) {
            return res.status(400).json({ message: 'User does not exists' });
        }

        if (about) {
            user.about = about;
        }

        if (drivingLicenseInfo) {
            user.drivingLicenseInfo = { ...drivingLicenseInfo }
        }

        if (verifiedId) {
            user.verifiedId = { ...verifiedId };
        }

        if (firstName) {
            user.firstName = firstName;
        }

        if (lastName) {
            user.lastName = lastName;
        }

        if (profileImg) {
            user.profileImg = profileImg;
        }

        user.save();
        return res.status(200).json({ user, message: 'Profile Updated' })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

const changePassword = async (req, res) => {
    try {
        const { id: userId, oldPassword, newPassword } = req.body;
        // Check if user exists
        let user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!user) {
            return res.status(400).json({ message: 'User does not exists' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Old Password' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.save();
        res.status(200).json({ message: 'password changed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    verifyOtp,
    sendAgainOtp,
    forgetPassword,
    getUserProfile,
    updateUserProfile,
    changePassword,
}