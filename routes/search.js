var express = require('express');
var router = express.Router();
const Course = require("../models/Course");
/* GET users listing. */
router.get('/', async function(req, res, next) {
  const q = req.query.q.trim();
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
    }, {
      score: {
        $meta: "textScore"
      }
    }).sort({
      score: {
        $meta: "textScore"
      }
    });
    res.json(response);
  } catch (err) {
    res.status(500).json("error");
  }
});

module.exports = router;