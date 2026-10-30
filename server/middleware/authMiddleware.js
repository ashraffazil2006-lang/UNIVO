const jwt = require("jsonwebtoken");

// Simple authentication middleware
function authMiddleware(req, res, next) {
  // Step 1: Read the Authorization header sent by the client
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please log in first.",
    });
  }

  // Step 2: Extract the token (handles both "Bearer <token>" and raw token)
  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Step 3: Verify the token using our secret key
  try {
    const secretKey = process.env.JWT_SECRET || "univo_super_secret_jwt_key_2026";
    const decoded = jwt.verify(token, secretKey);

    // Step 4: Attach the decoded user information to the request object
    req.user = decoded;

    // Step 5: Continue to the next function (the controller)
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = authMiddleware;
