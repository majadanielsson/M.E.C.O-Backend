const fs = require("fs");
const soap = require('soap');
var url = 'http://ws.selma7.its.uu.se/selmaws-uu/services/TillfalleTjanst?wsdl';
var args = {
  publicerad: "J",
  typ: "Kurs"
};
soap.createClient(url, function(err, client) {
  client.sokKursTillfalleKurspaket(args, function(err, result) {
    fs.writeFileSync("output2.json", JSON.stringify(result));
  });
});