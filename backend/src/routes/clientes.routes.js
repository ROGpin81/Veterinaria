const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const clientesController = require("../controllers/clientes.controller");

router.post("/", authMiddleware, clientesController.crear);
router.get("/", authMiddleware, clientesController.listar);
router.get("/:id", authMiddleware, clientesController.obtenerPorId);

module.exports = router;
