const { ConfirmOrder } = require("../models/returnProcessSchema");
const { ReturnLabel } = require("../models/returnProcessSchema");

exports.pickup = async (req, res) => {
    try {
        const pickupData = req.body;
        const newPickup = new ConfirmOrder(pickupData);
        await newPickup.save();

        // Modify the related return labels
        await ReturnLabel.updateMany(
            { userId: pickupData.orderDetails.userId, orderId: null },
            { orderId: pickupData.orderId }
        );

        res.status(201).send(newPickup);
    } catch (error) {
        res.status(500).send(error);
    }
};
