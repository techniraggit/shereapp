const Ride = require("../models/Ride");
const Communities = require("../models/Communities");

const publishRide = async (req, res) => {
  try {
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
    publishRide,
}
