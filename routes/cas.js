var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
const cas = "https://weblogin.uu.se/idp/profile/cas"; // CAS server URL
const querystring = require('querystring');

// Checks the ticket against the CAS server
router.get('/validate', function(req, res, next) {
  if (!req.query.ticket) res.status(400).send("Missing ticket");
  const query = {
    ticket: req.query.ticket.substring(0, 400),
    service: `${req.protocol}://${req.get('host')}/cas/validate/`
  };
  fetch(`${cas}/validate?${querystring.encode(query)}`)
    .then(response => response.text())
    .then(data => {
      var result = data.trim().split("\n");
      if (result[0] == "no") {
        res.status(401).send("Invalid ticket");
      } else if (result[0] == "yes") {
        var username = result[1];
        res.send(`Logged in as <b>${username}</b>`);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Server error");
    })
});


// Redirects to CAS login page
router.get('/login', function(req, res, next) {
  const query = {
    service: `${req.protocol}://${req.get('host')}/cas/validate/`
  };
  res.redirect(`${cas}/login?${querystring.encode(query)}`);
});

// Redirects to CAS logout page
router.get('/logout', function(req, res, next) {
  const query = {
    service: `${req.protocol}://${req.get('host')}/cas/validate/`
  };
  res.redirect(`${cas}/logout?${querystring.encode(query)}`);
});
module.exports = router;