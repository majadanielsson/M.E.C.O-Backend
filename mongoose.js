const mongoose = require("mongoose");
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@meco-ju6ws.mongodb.net/db?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error:"));
db.once("open", function() {
  console.log("Connected to database");
});

module.exports = db;