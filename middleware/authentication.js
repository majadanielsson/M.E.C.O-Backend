var jwt = require("jsonwebtoken");

module.exports = function () {
  return function (req, res, next) {
    if (
      req.cookies.access_token &&
      req.cookies.access_token.split(" ")[0] == "Bearer"
    ) {
      try {
        var token = req.cookies.access_token.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`User: ${req.user}`);
      } catch (err) {
        console.log(`Invalid JWT token:\n${err}`);
        res.status(403).json({
          message: "Invalid authentication",
          detail: "Invalid JWT token",
        });
      }
    }
    next();
  };
};
