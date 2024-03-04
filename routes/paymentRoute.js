const express = require("express");
const router = express.Router();
const paymentController = require("../controller/stripeController");
router.post("/", express.json(), paymentController.charge);
router.post(
    "/success",
    express.raw({ type: "application/json" }),
    paymentController.success
);

module.exports = router;
