const express = require("express");
const controller = require("../controllers/projectController");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

router.use(requireAuth);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.delete("/:id", controller.remove);

module.exports = router;
