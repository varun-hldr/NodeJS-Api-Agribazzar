const jwt = require("jsonwebtoken");
const keys = require("./config/keys");

module.exports = function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, keys.token.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.send({ mesage: "Invalid Token" });
  }
};
