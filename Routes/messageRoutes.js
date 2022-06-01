const express = require("express");
const {protect} = require("../middleware/authMiddleware");
const {sendMessage, allMessages, translate} = require("../controllers/messageControllers")

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.route('/translate').post(protect, translate);

module.exports = router;