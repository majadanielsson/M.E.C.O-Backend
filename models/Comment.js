const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
    required: true
  },
  instanceId: {
    type: String,
    required: true
  },
  votes: {
    up: [String],
    down: [String],
  },
  flag: Boolean
});

CommentSchema.index({
  instanceId: 1
});

module.exports = Report = mongoose.model("comment", CommentSchema);
