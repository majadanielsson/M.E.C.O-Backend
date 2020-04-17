var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
const blacklist = "{}$";

// @route     GET api/courseInstance
// @desc      Test route
// @access    Public
router.get("/", function (req, res, next) {
  res.send("hej oscar");
});
// @route    POST api/users
// @desc     Posts form
// @access   Public
  
  module.exports = router;