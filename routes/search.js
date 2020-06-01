var express = require('express');
var router = express.Router();
const Course = require("../models/Course");

// @route     GET /search?q=
// @desc      Searches courses and sorts them
// @access    Public
router.get('/', async function (req, res, next) {
  try {
    // Add quotes around words to require the words in results
    const q = (req.query.q.split(" ").length == 1) ? req.query.q.trim() : "\"" + req.query.q.trim().split(" ").join("\" \"") + "\"";
    const page = (req.query.page) ? parseInt(req.query.page) : 0;
    var totalCount = null;

    if (page == 0) {
      totalCount = await Course.countDocuments({
        $text: {
          $search: q
        }
      });
    }

    const response = await Course.find({
      $or: [{
        $text: {
          $search: q
        }
      },
      {
        _id: (q.length == 6) ? q.toUpperCase() : ""
      }
      ]
    }, { name: 1, nameEng: 1, extent: 1, extentUnit: 1 }).sort({
      date: -1
    }).skip(20 * page).limit(20);
    res.json({ data: response, total: totalCount });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;