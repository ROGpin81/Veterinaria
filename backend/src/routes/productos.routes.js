const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const productosController = require("../controllers/productos.controller");

router.get("/", authMiddleware, productosController.listar);
router.get("/:id", authMiddleware, productosController.obtenerPorId);

module.exports = router;
