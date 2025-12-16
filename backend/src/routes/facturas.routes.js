const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const facturasController = require("../controllers/facturas.controller");

router.get("/:idVenta", authMiddleware, facturasController.obtenerPorVenta);

module.exports = router;
