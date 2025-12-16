const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "MiClaveSecreta";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Falta header Authorization" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Formato inválido. Use: Bearer <token>" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
