const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = new mongoose.Schema({
  courseCode: {
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
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
  }]
});

module.exports = Report = mongoose.model("report", ReportSchema);