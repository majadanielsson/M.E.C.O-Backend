const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  kurskod: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  question1: {
    type: String,
    required: true,
  },
  question2: {
    type: String,
    required: true,
  },
  optionalQuestion: {
    type: String,
  },
});

module.exports = User = mongoose.model("report", ReportSchema);
