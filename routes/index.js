var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  // Authentication example 
  res.send((req.user) ? `Welcome ${req.user.username}` : "Welcome stranger");
});

module.exports = router;