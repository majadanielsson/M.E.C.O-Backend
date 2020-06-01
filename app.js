var createError = require("http-errors");
var express = require("express");
var path = require("path");

// Adds environment variables, only in development
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// Connects to database
var db = require("./mongoose")

// Middleware
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fileUpload = require('express-fileupload');
const authentication = require("./middleware/authentication.js");
var cors = require("./middleware/cors.js");

// Routes
var casRouter = require("./routes/cas");
var searchRouter = require("./routes/search");
var formRouter = require("./routes/courseInstance");
var commentsRouter = require("./routes/comments");
var csvRouter = require("./routes/csv");
var selmaRouter = require("./routes/selma");

var app = express();

// Request log middleware
app.use(logger("dev"));

// File upload middleware - adds files to req.files
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
}));

// JSON parser middleware - adds POST data to req.body
app.use(express.json());

// Cookie parser middleware - adds cookies to req.cookies
app.use(cookieParser());

// CORS middleware
app.use(cors());

// JWT Decode middleware - adds user info to req.user
app.use(authentication());

// Routes
app.use("/cas", casRouter);
app.use("/search", searchRouter);
app.use("/courses", formRouter);
app.use("/csv", csvRouter);
app.use("/comments", commentsRouter);
app.use("/selma", selmaRouter);

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
  res.end();
});

module.exports = app;
