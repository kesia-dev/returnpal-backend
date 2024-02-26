const express = require("express");
const router = express.Router();
const paymentController = require("../controller/stripeController");
router.post("/charge", paymentController.charge);

module.exports = router;
