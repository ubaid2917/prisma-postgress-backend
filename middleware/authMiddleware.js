import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Invalid token",
      });
    }

    req.user = decoded;
    next();
  });
};

export default authMiddleware;
