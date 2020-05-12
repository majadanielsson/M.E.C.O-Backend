var express = require('express');
var router = express.Router();
const neatCsv = require('neat-csv');

router.post("/", async function (req, res) {
    if (req.files.csv) {
        var formatted = [];
        var data = await neatCsv(req.files.csv.data, { skipLines: 1, headers: false });
        console.log(data);
        res.end();
    }
    else res.status(400).json({ message: "Invalid file", detail: "Invalid file" });
});
module.exports = router;