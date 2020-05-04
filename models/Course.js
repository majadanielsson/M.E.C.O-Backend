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
      _id: Number,
      date: String,
      responsible: [String],
      report: Report,
    },
  ],
});

CourseSchema.index({
  name: "text",
  nameEng: "text",
  responsible: 1,
});

module.exports = Report = mongoose.model("course", CourseSchema);
