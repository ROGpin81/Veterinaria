const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/register", authMiddleware, authController.register);

module.exports = router;
