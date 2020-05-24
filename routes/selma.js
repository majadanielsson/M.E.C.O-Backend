var express = require('express');
var router = express.Router();
const Course = require("../models/Course");
const url = 'http://ws.selma7.its.uu.se/selmaws-uu/services/TillfalleTjanst?wsdl';
const soap = require("soap");

router.get('/', async function (req, res, next) {
  if (!req.user || !req.user.role == "employee") {
    res.status(401).json({ message: "Authentication required" });
    return
  }
  var db = await Course.find({}, { _id: 1, name: 1, nameEng: 1, date: 1, extent: 1, extentUnit: 1, "instances._id": 1, "instances.date": 1 });
  var args = {
    sokord: ""
  };
  var jsonData;
  soap.createClient(url, function (err, client) {
    client.sokKursTillfalleKurspaket(args, async function (err, result) {
      if (result.return) {
        jsonData = result.return;

        var dataObj = {};
        for (var i = 0; i < jsonData.length; i++) {
          var source = jsonData[i];
          var id = source.kurskod;
          if (id) {
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
              dataObj[id].date = source.period;
            }
            dataObj[id].instances.push({
              date: source.period,
              _id: source.period.substring(0, 4) + "-" + source.anmalningskod,
              responsible: [],
              report: []
            });
          }
        }

        for (var i in db) {
          if (dataObj[db[i]._id]) {
            for (var j in db[i].instances) {
              var index = dataObj[db[i]._id].instances.findIndex(x => x._id == db[i].instances[j]._id);
              if (index != -1) {
                dataObj[db[i]._id].instances.splice(index, 1);
              }
            }
            if (dataObj[db[i]._id].instances.length == 0) {
              delete dataObj[db[i]._id];
            }
          }
        }
        var bulk = Course.collection.initializeUnorderedBulkOp();
        var data = Object.values(dataObj);
        for (var i in data) {
          bulk.find({ _id: data[i]._id }).upsert().updateOne({
            $set: {
              name: data[i].name,
              nameEng: data[i].nameEng,
              date: data[i].date,
              extent: data[i].extent,
              extentUnit: data[i].extentUnit,
            },
            $push: {
              instances: { $each: data[i].instances }
            },
          })
        }
        var result = await bulk.execute();
        res.json(result);
      }
    });
  });
});

module.exports = router;