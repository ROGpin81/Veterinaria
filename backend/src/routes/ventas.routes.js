const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const ventasController = require("../controllers/ventas.controller");

router.post("/", authMiddleware, ventasController.crear);
router.get("/", authMiddleware, ventasController.listar);
router.get("/:id", authMiddleware, ventasController.obtenerPorId);

module.exports = router;
