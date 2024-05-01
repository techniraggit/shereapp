const twilio = require('twilio');

function sendOtp(otp, mobileNumber) {
    const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // Send the OTP via SMS
    client.messages
    .create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: mobileNumber
    })
    .then(message => console.log(`OTP sent: ${message.sid}`))
    .catch(error => console.error(error));
}

module.exports = {
    sendOtp
}
