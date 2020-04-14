var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

// @route     GET api/validateForm
// @desc      Test route
// @access    Public
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  "/",
  [
    body("name", "Empty name").isLength({ min: 1 }),
    body("age", "Invalid age").optional({ checkFalsy: true }).isISO8601(),
    body("text").not().isEmpty().trim().escape(),
  ],
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      // Error messages can be returned in an array using `errors.array()`.
    } else {
      // Data from form is valid. Store in database
    }
  }
);

module.exports = router;
