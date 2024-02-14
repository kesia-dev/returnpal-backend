const mongoose = require('mongoose');

const orderSchema = new Schema({
    _id: ObjectId,
    order_number: String,
    order_date: Date,
    order_status: String,
    order_details: {
        total_cost: Number,
        pickup_date: Date,
        pickup_method: String,
        total_packages: Number,
        extra_packages_included: Number,
        promo_code: String,
    },
    pickup_details: {
        address_id: ObjectId,
        contact_full_name: String,
        street: String,
        unit_number: Number,
        city: String,
        province: String,
        country: String,
        postal_code: String,
        instructions: String,
    }
})