var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const cas = "https://weblogin.uu.se/idp/profile/cas"; // CAS server URL
const querystring = require('querystring');
var jwt = require('jsonwebtoken');

router.get('/login', function(req, res) {
  if (req.user) res.json({
    username: req.user.username
  });
  else res.status(403).json({
    message: "Invalid authentication",
    detail: "Invalid JWT token"
  });
});

// Checks the ticket against the CAS server, returns JWT
router.post('/login', function(req, res) {
  if (!req.body.ticket) res.status(400).json({
    message: "Not logged in",
    detail: "Missing ticket"
  });
  const query = {
    ticket: req.body.ticket.substring(0, 400),
    service: "http://localhost:3000/login/"
  };
  fetch(`${cas}/validate?${querystring.encode(query)}`)
    .then(response => response.text())
    .then(data => {
      var result = data.trim().split("\n");
      if (result[0] == "no") {
        res.status(401).json({
          message: "Login failed",
          detail: "Invalid ticket"
        });
      } else if (result[0] == "yes") {
        var user = {
          username: result[1]
        };
        var token = jwt.sign(user, process.env.JWT_SECRET);
        res.cookie('access_token', `Bearer ${token}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV == 'production'
        }).json({
          username: user.username
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "Server error, please try again",
        detail: "Ticket validation failed"
      });
    })
});

// Redirects to CAS logout page
router.get('/logout', function(req, res) {
  const query = {
    service: `${(process.env.NODE_ENV == 'production') ? "https" : req.protocol}://${req.get("host")}/cas/login`
  };
  res.redirect(`${cas}/logout?${querystring.encode(query)}`);
});

// Create fake JWT
router.post('/dev', function(req, res) {
  var user = (req.body) ? JSON.decode(req.body) : {
    username: "user1234"
  };
  var token = jwt.sign(user, process.env.JWT_SECRET);
  res.cookie('access_token', `Bearer ${token}`).json({
    username: user.username
  });
});
module.exports = router;