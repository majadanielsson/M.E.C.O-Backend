var express = require('express');
var router = express.Router();
const neatCsv = require('neat-csv');
const Course = require("../models/Course");

router.post("/", async function (req, res) {
    if (req.files.csv) {
        var formatted = [];
        var data = await neatCsv(req.files.csv.data, { skipLines: 1, headers: false });
        for (const i in data) {
            const courseId = data[i]["0"];
            const instanceId = data[i]["1"] + "-" + data[i]["2"];
            var evaluation = [];
            if (data[i]["4"] || data[i]["5"] || data[i]["6"] || data[i]["7"] || data[i]["8"] || data[i]["9"]) evaluation.push({
                _id: 0,
                answers: {
                    "0": data[i]["4"] ? parseInt(data[i]["4"]) : 0,
                    "1": data[i]["5"] ? parseInt(data[i]["5"]) : 0,
                    "2": data[i]["6"] ? parseInt(data[i]["6"]) : 0,
                    "3": data[i]["7"] ? parseInt(data[i]["7"]) : 0,
                    "4": data[i]["8"] ? parseInt(data[i]["8"]) : 0,
                    "5": data[i]["9"] ? parseInt(data[i]["9"]) : 0
                }
            });
            if (data[i]["11"] || data[i]["12"] || data[i]["13"] || data[i]["14"] || data[i]["15"] || data[i]["16"]) evaluation.push({
                _id: 1,
                answers: {
                    "0": data[i]["11"] ? parseInt(data[i]["11"]) : 0,
                    "1": data[i]["12"] ? parseInt(data[i]["12"]) : 0,
                    "2": data[i]["13"] ? parseInt(data[i]["13"]) : 0,
                    "3": data[i]["14"] ? parseInt(data[i]["14"]) : 0,
                    "4": data[i]["15"] ? parseInt(data[i]["15"]) : 0,
                    "5": data[i]["16"] ? parseInt(data[i]["16"]) : 0
                }
            });
            if (evaluation.length) formatted.push({
                courseId: courseId,
                instanceId: instanceId,
                evaluation: evaluation
            })
        }
        try {
            for (const i in formatted) {
                await Course.findOneAndUpdate(
                    {
                        _id: formatted[i].courseId,
                        "instances._id": formatted[i].instanceId,
                    },
                    {
                        $set: {
                            "instances.$.evaluation": formatted[i].evaluation,
                        },
                    }
                ).exec();
            };
            res.json({ message: "success" });
        }
        catch (err) { res.status(500).json({ message: "Server error", detail: "Server error" }) }
    }
    else res.status(400).json({ message: "Invalid file", detail: "Invalid file" });
});
module.exports = router;