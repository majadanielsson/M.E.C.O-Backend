const fs = require("fs");
var data = fs.readFileSync("output.json");
var jsonData = JSON.parse(data).return;
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
    _id: source.id
  });
}
fs.writeFileSync("data.json", JSON.stringify(Object.values(dataObj)));