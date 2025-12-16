const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const utilsController = require("../controllers/utils.controller");

router.get("/gethash/:plainText", utilsController.getHash);

router.get("/test", authMiddleware, utilsController.test);

module.exports = router;
