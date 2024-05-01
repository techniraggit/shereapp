const { Router } =  require("express");
const tokenMiddleware = require('../middlewares/auth');

const {
    registerUser,
    loginUser,
    refreshToken,
    verifyOtp,
    sendAgainOtp,
    forgetPassword,
    getUserProfile,
    updateUserProfile,
    changePassword,
} = require('../controllers/user');

const {
    createCommunity,
    fetchOwnerCommunityList,
    fetchMemberCommunityList,
    fetchCommunityDetails,
    removeMemberFromCommunity,
} = require('../controllers/community')

let UserRoutes = Router();

// user Routes
UserRoutes.post('/register', registerUser);
UserRoutes.post('/login', loginUser);
UserRoutes.post('/refresh-token', refreshToken)
UserRoutes.post('/verify-otp', verifyOtp);
UserRoutes.post('/send-otp', sendAgainOtp);
UserRoutes.post('/forget-password', forgetPassword);
UserRoutes.get('/get-user-profile/:id', tokenMiddleware, getUserProfile);
UserRoutes.put('/update-user-profile', tokenMiddleware, updateUserProfile);
UserRoutes.put('/update-password', tokenMiddleware, changePassword);

// community routes
UserRoutes.post('/create-community', tokenMiddleware, createCommunity);
UserRoutes.get('/fetch-owner-communities/:ownerId', tokenMiddleware, fetchOwnerCommunityList);
UserRoutes.get('/fetch-member-communities/:ownerId', tokenMiddleware, fetchMemberCommunityList);
UserRoutes.get('/get-community-details/:id', tokenMiddleware, fetchCommunityDetails);
UserRoutes.put('/remove-community-member', tokenMiddleware, removeMemberFromCommunity);

module.exports = UserRoutes;
