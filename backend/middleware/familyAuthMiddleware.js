const jwt = require("jsonwebtoken");

const familyAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.role !== "family" ||
      !decoded.patientId
    ) {
      return res.status(401).json({
        message: "Invalid family authentication.",
      });
    }

    req.patientId = decoded.patientId;
    req.hospitalId = decoded.hospitalId;

    next();
  } catch (error) {
    console.error(
      "Family authentication error:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired authentication token.",
    });
  }
};

module.exports = familyAuthMiddleware;