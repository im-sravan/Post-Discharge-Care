const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
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

    // Only hospital accounts can access
    // hospital-protected routes.
    if (
      decoded.role !== "hospital" ||
      !decoded.hospitalId
    ) {
      return res.status(403).json({
        message:
          "Hospital authentication required.",
      });
    }

    req.hospitalId = decoded.hospitalId;
    req.hospitalEmail = decoded.email;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      message:
        "Invalid or expired authentication token.",
    });
  }
};

module.exports = authMiddleware;