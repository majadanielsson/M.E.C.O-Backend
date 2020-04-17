var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const blacklist = "{}$";
const Report = require("../../models/Report");

// @route     GET api/courseInstance
// @desc      Test route
// @access    Public
router.get("/", async function (req, res, next) {
  try {
    const report = await Report.findById(req.params.id);
    res.send(report);

    // Check for ObjectId format and post
    //if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !report) {
    //return res.status(404).json({ msg: "Report not found" });
    //}
    res.json(report);
    res.send("Got report");
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});
// @route    POST api/users
// @desc     Posts form
// @access   Public
router.post(
  "/",
  [
    body("courseCode", "Invalid input")
      .trim()
      .escape()
      .blacklist(blacklist)
      .isEmpty(),
    body("question1", "Invalid input")
      .trim()
      .escape()
      .blacklist(blacklist)
      .isEmpty(),
    body("question2", "Invalid input")
      .trim()
      .escape()
      .blacklist(blacklist)
      .isEmpty(),
  ],
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
      return res.status(422).json({ errors: errors.array() });
    } else {
      // Data from form is valid. Store in database
      try {
        const { courseCode, question1, question2 } = req.body;
        const newReport = new Report({
          courseCode: courseCode,
          //author: req.user.id,
          //date: getDate();
          question1: question1,
          question2: question2,
        });
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
