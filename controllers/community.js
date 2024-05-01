const _ = require("lodash");
const mongoose = require("mongoose");
const Communities = require("../models/Communities");
const User = require("../models/User");

const createCommunity = async (req, res) => {
  try {
    const { communityName, description, communityIcon, ownerId } = req.body;
    const community = await Communities.create({
      communityName,
      description,
      communityIcon,
      ownerId,
    });
    return res
      .status(201)
      .json({ community, message: "Community Created Successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const fetchOwnerCommunityList = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const page = parseInt(req.query.page) || 1; // current page number
    const limit = parseInt(req.query.limit) || 10; // number of items per page
    const skip = (page - 1) * limit; // number of items to skip
    const ownerCommunities = await Communities.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).skip(skip).limit(limit);
    const data = _.map(ownerCommunities, (community) => ({
      _id: _.get(community, '_id'),
      communityName: _.get(community, "communityName"),
      members: _.size(_.get(community, "members", [])),
      membersList: _.get(community, "members", []),
      activeRides: _.size(_.get(community, "rides", [])),
      communityIcon: _.get(community, 'communityIcon', '')
    }));
    return res.status(200).json({ data });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const fetchMemberCommunityList = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const page = parseInt(req.query.page) || 1; // current page number
    const limit = parseInt(req.query.limit) || 10; // number of items per page
    const skip = (page - 1) * limit; // number of items to skip
    const ownerCommunities = await Communities.aggregate([
      { $match: { members: { $in: [ownerId] } } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "communityUsers",
        },
      },
      {
        $unwind: "$communityUsers",
      },
      {
        $project: {
          communityUsers: 1,
          communityName: 1,
          communityIcon: 1,
          rides: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
    const data = _.map(ownerCommunities, (community) => ({
      _id: _.get(community, '_id'),
      communityName: _.get(community, "communityName"),
      communityOwnerName: `${_.get(
        community,
        "communityUsers.firstName"
      )} ${_.get(community, "communityUsers.lastName")}`,
      activeRides: _.size(_.get(community, "rides", [])),
      communityIcon:  _.get(community, "communityIcon", '')
    }));
    return res.status(200).json({ data });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const fetchCommunityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1; // current page number
    const limit = parseInt(req.query.limit) || 10; // number of items per page
    const skip = (page - 1) * limit; // number of items to skip
    const communityData = await Communities.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "communityUsers",
        },
      },
      {
        $unwind: "$communityUsers",
      },
      {
        $project: {
          communityUsers: 1,
          communityName: 1,
          communityIcon: 1,
          description: 1,
          createdAt: 1,
          members: 1,
          ownerId: 1
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);
    const memberIds = _.map(
      _.get(_.head(communityData), "members", []),
      (memberId) => new mongoose.Types.ObjectId(memberId)
    );
    const memberList = await User.find(
      { _id: { $in: memberIds } },
      { firstName: 1, lastName: 1, phoneNumber: 1, profileImg: 1, email: 1 }
    );
    return res.status(200).json({
      communityIcon: _.get(_.head(communityData), "communityIcon", ""),
      communityName: _.get(_.head(communityData), "communityName", ""),
      members: _.size(_.get(_.head(communityData), "members", [])),
      createdBy: `${_.get(
        _.head(communityData),
        "communityUsers.firstName",
        ""
      )} ${_.get(_.head(communityData), "communityUsers.lastName", "")}`,
      createdAt: _.get(_.head(communityData), "createdAt", ""),
      memberList,
      ownerId: _.get(_.head(communityData), 'ownerId', ''),
      description: _.get(_.head(communityData), 'description', '')
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const removeMemberFromCommunity = async (req, res) => {
  try {
    const { memberId, communityId } = req.body;
    const community = await Communities.findOne({ _id: new mongoose.Types.ObjectId(communityId) });
    const updatedMembers = _.filter(_.get(community, 'members'), (member) => member !== memberId);
    community.members = [...updatedMembers];
    community.save();
    return res.status(200).json({ message: 'Member Removed' })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createCommunity,
  fetchOwnerCommunityList,
  fetchMemberCommunityList,
  fetchCommunityDetails,
  removeMemberFromCommunity,
};
