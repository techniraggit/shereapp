const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    communityName: {
      type: String,
      required: [true, "Community Name is Required"],
    },
    description: {
      type: String,
      required: [true, "Community Description is Required"],
    },
    communityIcon: {
      type: String,
    },
    members: {
      type: Array,
    },
    rides: {
      type: Array
    },
    ownerId: mongoose.ObjectId,
  },
  { timestamps: true }
);

const Communities = mongoose.model("Communities", communitySchema);

module.exports = Communities;
