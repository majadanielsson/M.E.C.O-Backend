const fs = require("fs");
var data = fs.readFileSync("data.json");
var jsonData = JSON.parse(data).return;
var dataOut = [];
for (var i = 0; i < jsonData.length; i++) {
  dataOut[i] = {
    _id: jsonData[i].kurs.kurskod,
    name: jsonData[i].kurs.namn,
    nameEng: jsonData[i].kurs.namnEng,
    date: jsonData[i].startvecka,
    extent: jsonData[i].kurs.omfattningsvarde,
    extentUnit: jsonData[i].kurs.omfattningsenhet,
    instances: [],
    syllabusId: jsonData[i].kplanid
  }
}
fs.writeFileSync("output.json", JSON.stringify(dataOut));