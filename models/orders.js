const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema({
  contact_full_name: String,
  contact_phone_number: String,
  street: String,
  unit_number: String,
  city: String,
  province: { type: String, default: "Ontario" },
  country: { type: String, default: "Canada" },
  postal_code: {
    type: String,
    validate: {
      validator: (value) => /^\d{5}$/.test(value), // Adjusted regex for 5-digit postal code
      message: "Invalid postal code format",
    },
  },
  instructions: String,
  primary: { type: Boolean, default: false },
});

const packageDetailSchema = new Schema({
  attachment: String,
  label_type: String,
  description: String,
});

const pickupDetailSchema = new Schema({
  full_name: String,
  phone_number: String,
  street: String,
  unit_number: String,
  city: String,
  province: { type: String, default: "Ontario" },
  country: { type: String, default: "Canada" },
  postal_code: {
    type: String,
    validate: {
      validator: (value) => /^\d{5}$/.test(value), // Adjusted regex for 5-digit postal code
      message: "Invalid postal code format",
    },
  },
  instructions: String,
  pickup_date: Date,
  pickup_method: String,
});

const orderDetailsSchema = new Schema({
  total_cost: Number,
  promo_code: String,
  total_packages: Number,
  extra_packages_included: Number,
  package_details: [packageDetailSchema],
  pickup_details: pickupDetailSchema,
});

const clientDetailsSchema = new Schema({
  first_name: String,
  last_name: String,
  subscription: String,
  subscription_expiry_date: Date,
  email: String,
  phone_number: String,
  payment_type: String,
  addresses: [addressSchema],
});

const orderSchema = new Schema({
  order_number: String,
  order_date: Date,
  status: {
    type: String,
    enum: [
      "Driver received",
      "Driver on the way",
      "Driver delivered to post office",
      "Delivered",
      "Cancelled",
    ],
  },
  order_details: orderDetailsSchema,
  client_details: clientDetailsSchema,
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
