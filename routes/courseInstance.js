var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();

const { body, validationResult } = require("express-validator");
const blacklist = "{}$";
const Report = require("../models/Report");
const Course = require("../models/Course");

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// @route     GET /reports
// @desc      Test route
// @access    Public
router.get("/", urlencodedParser, async function (req, res, next) {
  var courseID = req.query.courseID;
  var responsible = req.query.responsible;
  //check if courseID was provided
  if (responsible) {
    // Get course by ID in course collection
    try {
      const courseInstances = await Course.find({
        instances: { $elemMatch: { responsible: responsible } },
      });
      res.json(courseInstances);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  } else {
    try {
      // Get all entries in Courses

      const report = await Course.find();

      res.json(report);
    } catch (err) {
      console.error(err.message);

      res.status(500).send("Server Error");
    }
  }
});
// @route    POST api/users
// @desc     Posts form
// @access   Public
router.post(
  "/",
  [
    body("questions.*.answer", "Invalid input")
      .trim()
      .escape()
      .blacklist(blacklist)
      .isLength({ min: 1, max: 10 }),
  ],

  jsonParser,
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    var courseID = req.query.courseID;
    var instanceID = req.query.instanceID;
    var author = req.user.name;
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      console.log("Found validation errors");
      return res.status(422).json({ errors: errors.array() });
    } else {
      // Data from form is valid. Store in database
      console.log(req.body);
      const { questions } = req.body;
      try {
        const newReport = new Report({
          author: author,
          questions: questions,
        });

        Course.findOneAndUpdate(
          { _id: courseID, "instances._id": instanceID },
          { $set: { "instances.$.report": newReport } }
        ).exec();

        const report = await newReport.save();
        res.json(report);
        console.log("Report posted to DB");
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  }
);

module.exports = router;
