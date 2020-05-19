var express = require('express');
var router = express.Router();
const Course = require("../models/Course");
const Comment = require("../models/Comment");
const crypto = require('crypto');
const secret = "secret";
router.get('/:instanceId', async function (req, res) {
  try {
    var comments = await Comment.find({ instanceId: req.params.instanceId }, { comment: 1, votes: 1, date: 1 }).sort({ date: 1 });
    res.json(comments);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/:courseId/:instanceId', async function (req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return
  }
  try {
    var course = await Course.findOne(
      {
        _id: req.params.courseId,
        instances: {
          $elemMatch: {
            "_id": req.params.instanceId,
            "report.0": { $exists: true }
          }
        }
      },
      { _id: 1 });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }
  var comment = new Comment({
    comment: req.body.comment,
    instanceId: req.params.instanceId,
    author: crypto.createHmac('sha256', secret)
      .update('req.user.username')
      .digest('hex')
  });
  try {
    var newComment = await comment.save();
    res.json(newComment);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch('/:commentId/:action', async function (req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return
  }

  var update;
  switch (req.params.action) {
    case "up":
      update = {
        $addToSet: {
          "votes.up": hash
        },
        $pull: {
          "votes.down": hash
        }
      }
      break
    case "down":
      update = {
        $addToSet: {
          "votes.down": hash
        },
        $pull: {
          "votes.up": hash
        }
      }
      break
    case "clear":
      update = {
        $addToSet: {
          "votes.down": hash
        },
        $pull: {
          "votes.up": hash
        }
      }
      break
    default:
      res.status(404).json({ message: "Incorrect request" });
      return
  }
  var hash = crypto.createHmac('sha256', secret)
    .update('req.user.username')
    .digest('hex');
  try {
    var comment = await Comment.findOneAndUpdate({ _id: req.params.commentId }, update, { new: true });
    res.json({ _id: comment._id, votes: comment.votes });
    return
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }
})

module.exports = router;