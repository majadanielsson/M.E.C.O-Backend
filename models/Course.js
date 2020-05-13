const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var Report = require("./Report").schema;

const CourseSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nameEng: {
    type: String,
    required: true,
  },
  extent: {
    type: Number,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  extentUnit: {
    type: String,
    required: true,
  },
  instances: [
    {
      _id: String,
      date: String,
      responsible: [String],
      report: [Report],
      evaluation: [{ _id: Number, answers: { "0": Number, "1": Number, "2": Number, "3": Number, "4": Number, "5": Number }, average: Number, total: Number }]
    },
  ],
});

CourseSchema.index({
  name: "text",
  nameEng: "text",
  responsible: 1,
});

module.exports = Report = mongoose.model("course", CourseSchema);
