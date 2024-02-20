const mongoose = require('mongoose');
const { Schema } = mongoose;

// ReturnProcessSchema
const returnProcessSchema = new mongoose.Schema({
    dateAndTime: { type: Date, required: true },
    deliveryOption: { type: String, required: true },
    price: { 
        name: { type: String, required: true },
        price: { type: Number, required: true },
        itemId: { type: String, required: true },
    },
    confirmPickUp: {
        subscriptionItem: {
            itemId: { type: String, required: true },
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
            },
        packageItem: {
            itemId: { type: String, required: true },
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
            },
        expiryDate: {
            orderDate: { type: Date, required: true },
            subscription: { type: String, required: true },
            },
        calculateCost: {
            subscription: { type: String, required: true },
            packages: { type: Number, required: true },
        },
    },
    image: { type: String, required: true },
    orderConfirmation: { orderSchema },
});

// Stripe Schema
const orderSchema = new Schema({
        order_number: { type: String },
        order_date: { type: Date },
        order_status: { type: String },
        name: { type: String, required: true },
        orderRef: { type: String, required: true },
        email: { type: String, required: true },
        location: { type: String, required: true },
        cardType: { type: String, required: true },
        cardNumber: { type: Number, required: true },
        paymentSuccessful: { type: Boolean, required: true },
        order_details: {
            total_cost: { type: Number },
            pickup_date: { type: Date, required: true },
            pickup_method: { type: String, required: true },
            total_packages: { type: Number },
            extra_packages_included: {type: Number },
            promo_code: { type: String },
            pickup_details: {   
                address_id: { ObjectId },
                contact_full_name: { type: String, required: true },
                contact_phone_number: { type: Number, required: true },
                unit_number: { type: Number, required: true },
                street: { type: String, required: true },
                city: { type: String, required: true },
                province: { type: String, required: true },
                country: { type: String, required: true },
                postal_code: { type: String, required: true },
                instructions: { type: String, required: true},
            }
        }
    });

module.exports = mongoose.model('returnProcess', returnProcessSchema);
