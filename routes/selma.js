var express = require('express');
var router = express.Router();
const soap = require('soap');
/* GET users listing. */
router.get('/', function(req, res, next) {
  var url = 'http://ws.selma7.its.uu.se/selmaws-uu/services/PlanTjanst?wsdl';
  var args = {
    benamning: ''
  };
  soap.createClient(url, function(err, client) {
    client.sokKursplan(args, function(err, result) {
      console.log(result);
      res.send(result);
    });
  });
});

module.exports = router;