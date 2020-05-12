var express = require("express");
var router = express.Router();

const { body, validationResult } = require("express-validator");
const blacklist = "{}$";
const Report = require("../models/Report");
const Course = require("../models/Course");

// @route     GET /reports
// @desc      if responible == true, return every parent course
//            and course instance that the responsible is included in
//            otherwise return all courses
// @access    Public
router.get("/:courseId?", async function (req, res, next) {
  var courseID = req.params.courseId;
  var responsible = req.query.responsible;
  /* If responsible == true, return every parent course
     and course instance that the responsible is included in */
  if (responsible == "true") {
    try {
      const courseInstances = await Course.aggregate([
        {
          $match: {
            "instances.responsible": req.user.username,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            nameEng: 1,
            extent: 1,
            date: 1,
            extentUnit: 1,
            instances: {
              $filter: {
                input: "$instances",
                as: "instance",
                cond: {
                  $in: [req.user.username, "$$instance.responsible"],
                },
              },
            },
          },
        },
      ]);

      res.json(courseInstances);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  } else if (courseID) {
    try {
      // Get all documents in Course

      const course = await Course.findById(courseID);
      if (!course) res.status(404).json({ message: "Not found", detail: "No match for ID" });
      res.json(course);
    } catch (err) {
      console.error(err.message);

      res.status(500).send("Server Error");
    }
  }
});

router.get("/:courseId/:instanceId", async function (req, res) {
  try {
    const course = await Course.find(
      {
        _id: req.params.courseId,
        "instances._id": req.params.instanceId,
      },
      {
        "instances.$": true,
        name: true,
        nameEng: true,
      }
    );
    if (course && course[0].instances) {
      res.json({
        ...course[0].instances[0].toObject(),
        name: course[0].name,
        courseId: course[0]._id,
      });
    } else res.status(404).json({ message: "The requested instance was not found", detail: "No match" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", detail: "Server error" });
  }
});

router.post(
  "/:courseId/:instanceId/comment",
  [
    body("comment", "Invalid input")
      .trim()
      .escape()
      .blacklist(blacklist)
      .isLength({
        min: 1,
      }),
  ],
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    var courseID = req.params.courseId;
    var instanceID = req.params.instanceId;
    var comment = req.body.comment;

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      console.log("Found validation errors");
      return res.status(422).json({
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Store in database
      console.log(req.body);
      // Add comment to the comments-array of the latest report in instances
      try {
        var reportID = Course.find({
          _id: courseID,
          "instances._id": instanceID,
        });

        await Course.findOneAndUpdate(
          {
            _id: courseID,
            "instances._id": instanceID,
          },
          {
            $push: {
              "instances.$.report.0.comments": comment,
            },
          }
        ).exec();

        res.json(comment);
        console.log("Comment posted to report");
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  }
);

// @route    POST api/users
// @desc     Posts form
// @access   Public
router.post(
  "/:courseId/:instanceId",
  [
    body("questions.*.answer", "Invalid input")
      .trim()
      .escape()
      .blacklist(blacklist)
      .isLength({
        min: 1,
      }),
  ],
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    var courseID = req.params.courseId;
    var instanceID = req.params.instanceId;
    var author = req.user.name;
    console.log(req.body);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      console.log("Found validation errors");
      return res.status(422).json({
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Store in database
      console.log(req.body);
      const { questions } = req.body;

      try {
        const newReport = new Report({
          author: author,
          questions: questions,
        });
        //Push a new report to the "reports"-array
        var report = await Course.findOneAndUpdate(
          {
            _id: courseID,
            "instances._id": instanceID,
          },
          {
            $push: {
              "instances.$.report": {
                $each: [newReport],
                $position: 0,
              },
            },
          }
        ).exec();
        res.json(report);
        //const report = await newReport.save();
        // res.json(report);
        console.log("Report posted to DB");
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  }
);

module.exports = router;
