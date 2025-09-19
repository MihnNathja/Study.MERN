require("dotenv").config();

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const white_lists = ["/", "/register", "/login"];

  if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
    next();
  } else {
    if (req?.headers?.authorization?.split(" ")?.[1]) {
      const token = req.headers.authorization.split(" ")[1];

      //verify token

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
          id: decoded.id,
          email: decoded.email,

          name: decoded.name,

          createdBy: "hoidanit",
        };

        //console.log(">>> check token:", decoded);

        next();
      } catch (error) {
        return res.status(401).json({
          message: "Token expired/or invalid",
        });
      }
    } else {
      return res.status(401).json({
        message:
          "You have not passed an Access Token in the header/Or token outdated",
      });
    }
  }
};

module.exports = auth;
