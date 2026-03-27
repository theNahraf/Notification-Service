const express = require("express");
const controller = require("../controllers/apiKeyController");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", controller.createKey);
router.get("/", controller.listKeys);
router.delete("/:keyId", controller.revokeKey);
router.post("/:keyId/regenerate", controller.regenerateKey);

module.exports = router;
