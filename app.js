var createError = require("http-errors");
var express = require("express");
// Adds environment variables, only in development
if (process.env.NODE_ENV !== "production") require("dotenv").config();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const authentication = require("./middleware/authentication.js");
var cors = require("./middleware/cors.js");
const mongoose = require("mongoose");
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@meco-ju6ws.mongodb.net/test?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error:"));
db.once("open", function () {
  console.log("Connected to database");
});

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var casRouter = require("./routes/cas");
var formRouter = require("./routes/api/Form");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
// Allow localhost
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
// Adds user info to req.user
app.use(authentication());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cas", casRouter);
app.use("/api/form", formRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
