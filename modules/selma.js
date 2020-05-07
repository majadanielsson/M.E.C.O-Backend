const fs = require("fs");
const soap = require('soap');
const url = 'http://ws.selma7.its.uu.se/selmaws-uu/services/TillfalleTjanst?wsdl';
var jsonData;
var args = {
  sokord: ""
};
if (fs.existsSync("raw.json")) {
  jsonData = JSON.parse(fs.readFileSync("raw.json")).return;
  formatSave();
} else {
  soap.createClient(url, function(err, client) {
    client.sokKursTillfalleKurspaket(args, function(err, result) {
      if (result.return) {
        jsonData = result.return;
        formatSave();
      }
    });
  });
}

function formatSave() {
  var dataObj = {};
  for (var i = 0; i < jsonData.length; i++) {
    var source = jsonData[i];
    var id = source.kurskod;
    if (!dataObj[id]) dataObj[id] = {
      _id: id,
      name: source.namn,
      nameEng: source.namnEng,
      date: source.period,
      extent: source.omfattningsvarde,
      extentUnit: source.omfattningsenhet,
      instances: []
    }
    if (dataObj[id].date < source.period) {
      dataObj[id].name = source.namn;
      dataObj[id].nameEng = source.namnEng;
      dataObj[id].date = source.period;
      dataObj[id].extent = source.omfattningsvarde;
      dataObj[id].extentUnit = source.omfattningsenhet;
    }
    dataObj[id].instances.push({
      date: source.period,
      instanceId: source.anmalningskod,
      _id: source.id,
      responsible: [],
      report: []
    });
  }
  fs.writeFileSync("data.json", JSON.stringify(Object.values(dataObj)));
}