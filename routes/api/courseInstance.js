var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const blacklist = "{}$";
const Report = require("../../models/Report");
const Course = require("../../models/Course");

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// @route     GET api/courseInstance
// @desc      Test route
// @access    Public
router.get("/", urlencodedParser, async function (req, res, next) {
  var courseCode = req.query.courseCode;
  var courseID = req.query.courseID;
  //check if courseID was provided
  if (courseID) {
    // Get course by ID in course collection
    try {
      const course = await Course.findById(courseID);

      res.json(course);
    } catch (err) {
      console.error(err.message);

      res.status(500).send("Server Error");
    }
  } else if (courseCode) {
    // Get all instances of a single course in the reports collection
    try {
      const report = await Report.find({ courseCode: courseCode });

      res.json(report);
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
    body("courseCode", "Invalid input").trim().escape(),
    //body("questions", "Invalid input").trim().escape(). blacklist()
  ],

  jsonParser,
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    var courseID = req.query.courseID;
    var instanceID = req.query.instanceID;
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      console.log("Found validation errors");
      return res.status(422).json({ errors: errors.array() });
    } else {
      // Data from form is valid. Store in database
      console.log(req.body);
      const { courseCode, author, questions } = req.body;

      try {
        const newReport = new Report({
          courseCode: courseCode,
          author: author,
          questions: questions,
        });
        //const filter = { _id: courseID, "instances._id": instanceID };
        // const update = { instances: { report: newReport } };
        // let doc = await Course.findOneAndUpdate(filter, update);
        Course.findOneAndUpdate(
          { _id: courseID, "instances._id": instanceID },
          { $set: { "instances.$.report": { report: newReport } } }
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
