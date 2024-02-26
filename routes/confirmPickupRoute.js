const express = require('express');
const router = express.Router();
const confirmPickupController = require('../controller/confirmPickupController');

router.post('/', confirmPickupController);

module.exports = router;
