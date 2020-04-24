const fs = require("fs");
var data = fs.readFileSync("data.json");
var jsonData = JSON.parse(data);
var dataObj = {};
for (var i = 0; i < jsonData.length; i++) {
  var source = jsonData[i];
  var id = source.kurs.kurskod;
  if (!dataObj[id]) dataObj[id] = {
    _id: id,
    name: source.kurs.namn,
    nameEng: source.kurs.namnEng,
    date: source.startvecka,
    extent: source.kurs.omfattningsvarde,
    extentUnit: source.kurs.omfattningsenhet,
    instances: []
  };
  if (dataObj[id].date < source.startvecka) {
    dataObj[id].name = source.kurs.namn;
    dataObj[id].nameEng = source.kurs.namnEng;
    dataObj[id].date = source.startvecka;
    dataObj[id].extent = source.kurs.omfattningsvarde;
    dataObj[id].extentUnit = source.kurs.omfattningsenhet;
  }
  dataObj[id].instances.push({
    date: source.startvecka,
    _id: source.kplanid
  });
}
fs.writeFileSync("output.json", JSON.stringify(Object.values(dataObj)));