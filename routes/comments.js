var express = require('express');
var router = express.Router();
const Course = require("../models/Course");
const Comment = require("../models/Comment");
const BannedUser = require("../models/BannedUser");
const crypto = require('crypto');
const secret = "secret";

function formatComment(comment) {
  return {
    _id: comment._id,
    comment: comment.comment,
    votes: comment.votes.up.length - comment.votes.down.length,
    date: comment.date,
    flag: comment.flag ? comment.flag.length : undefined
  }
}

// @route     GET /comments/
// @desc      Get all comments with filtering
//            with query flag=true returns all reported comments
// @access    Employee
// TODO - ROLES
router.get("/", async function (req, res) {
  try {
    if (!req.user || !req.user.role == "employee") {
      res.status(401).json({ message: "Authentication required" });
      return
    }
    if (req.query.flag == "true") {
      var comments = await Comment.find({ 'flag.0': { $exists: true } }, { comment: 1, votes: 1, date: 1, flag: 1 });
      res.json(comments.map(comment => (formatComment(comment))));
    }
    else {
      res.status(403).json({ message: "Missing parameters" })
      return
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }
})

// @route     GET /comments/:instanceId
// @desc      Get comments for course instance
// @access    Public
router.get('/:instanceId', async function (req, res) {
  try {
    var comments = await Comment.find({ instanceId: req.params.instanceId }, { comment: 1, votes: 1, date: 1 });
    res.json(comments.map(comment => (formatComment(comment))));
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }
});

// @route   POST /comments/:courseId/:instanceId
// @desc    Write a comment
// @access  Authenticated
router.post('/:courseId/:instanceId', async function (req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return
    }

    var hash = crypto.createHmac('sha256', secret).update(req.user.username).digest('hex');
    var ban = await BannedUser.findOne({ _id: hash })
    if (ban && ban.expires > new Date()) {
      res.status(403).json({ message: "User banned", expires: ban.expires.toLocaleDateString() });
      return
    }
    // TODO - Comment max length
    var inputComment = req.body.comment.trim();
    if (!inputComment.length) {
      res.status(400).json({ message: "Validation failed" });
      return
    }

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
    var comment = new Comment({
      comment: req.body.comment,
      instanceId: req.params.instanceId,
      author: hash
    });
    var newComment = await comment.save();
    res.json(formatComment(newComment));
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }
});

// @route     PATCH /comments/:commentId/:action
// @desc      Vote, flag, unvote or unflag a comment
// @access    Authenticated
router.patch('/:commentId/:action', async function (req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return
    }
    var hash = crypto.createHmac('sha256', secret)
      .update(req.user.username)
      .digest('hex');
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
          $pull: {
            "votes.up": hash,
            "votes.down": hash
          }
        }
        break
      case "flag":
        update = {
          $addToSet: {
            "flag": hash
          }
        }
        break
      case "unflag":
        update = {
          $pull: {
            "flag": hash
          }
        }
        break
      default:
        res.status(404).json({ message: "Incorrect request" });
        return
    }

    var comment = await Comment.findOneAndUpdate({ _id: req.params.commentId }, update, { new: true });
    res.json(formatComment(comment));
    return
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }
})

// @route     DELETE /comments/:commentId
// @desc      Deletes a comment
// @access    Employee
// TODO - ROLES
router.delete("/:commentId", async function (req, res) {
  try {
    if (!req.user || !req.user.role == "employee") {
      res.status(401).json({ message: "Authentication required" });
      return
    }
    await Comment.remove({ _id: req.params.commentId });
    res.json({ message: "Comment deleted" });
    return
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }

})

// @route     PUT /comments/:commentId/ban
// @desc      Bans the writer of a comment for 30 days
// @access    Employee
// TODO - ROLES
router.put("/:commentId/ban", async function (req, res) {
  try {
    if (!req.user || !req.user.role == "employee") {
      res.status(401).json({ message: "Authentication required" });
      return
    }
    var comment = await Comment.findOne({ _id: req.params.commentId }, { author: 1 });
    var expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await new BannedUser({ _id: comment.author, expires: expires }).save();
    res.json({ message: "User banned" });
    return
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
    return
  }

})
module.exports = router;