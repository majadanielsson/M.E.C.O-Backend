var express = require('express');
var router = express.Router();
const Course = require("../models/Course");
/* GET users listing. */
router.get('/', async function(req, res, next) {
  const q = req.query.q.trim();
  const page = (req.query.page) ? parseInt(req.query.page.trim()) : 0;
  try {
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
    }).select("name nameEng extent extentUnit").sort({
      date: -1
    }).skip(20 * page).limit(20);
    res.json(response);
  } catch (err) {
    res.status(500).json("error");
  }
});

module.exports = router;