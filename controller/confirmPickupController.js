const { ConfirmOrder } = require('../models/returnProcessSchema');

exports.pickup = async (req, res) => {
    try {
        const pickupData = req.body;
        const newPickup = new ConfirmOrder(pickupData);
        await newPickup.save();
        res.status(201).send(newPickup);
    } catch (error) {
        res.status(500).send(error);
    }
};