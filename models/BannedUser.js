const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BannedUserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
  expires: {
    type: Date,
    required: true
  },
});

module.exports = Report = mongoose.model("banned_user", BannedUserSchema);
