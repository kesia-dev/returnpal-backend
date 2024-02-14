const mongoose = require('mongoose');


// TODO: Unsure if I should be using the same schema for every individual file..

const returnProcessSchema = new mongoose.Schema({
    dateAndTime: {
        type: Date,
        required: true,
    },
    deliveryOption: {
        type: String,
        required: true,
    },
    price: {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        itemId: {
            type: String,
            required: true,
        },
    },
    confirmPickUp: {
        subscriptionItem: {
            itemId: {
                type: String,
                required: true,
                },
            itemName: {
                type: String,
                required: true,
                },
            quantity: {
                type: Number,
                required: true,
                },
            },
        packageItem: {
            itemId: {
                type: String,
                required: true,
                },
            itemName: {
                type: String,
                required: true,
                },
            quantity: {
                type: Number,
                required: true,
                },
            },
        expiryDate: {
            orderDate: {
                type: Date,
                required: true,
                },
            subscription: {
                type: String,
                required: true,
                },
            },
        calculateCost: {
            subscription: {
                type: String,
                required: true,
                },
            packages: {
                type: Number,
                required: true,
                },
        },
    },
    orderConfirmation: {
        order: {
            name: {
                type: String,
                required: true,
            },
            orderRef: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            location: {
                type: String,
                required: true,
            },
            pickUpDate: {
                type: Date,
                required: true,
            },
            pickUpMethod: {
                type: String,
                required: true,
            },
            totalPackages: {
                type: Number,
                required: true,
            },
            cardType: {
                type: String,
                required: true,
            },
            cardNumber: {
                type: Number,
                required: true,
            },
            order_details: {
                pickup_date: {
                    type: Date,
                    required: true,
                },
                pickup_method: {
                    type: String,
                    required: true,
                },
                pickup_details: {
                    contact_full_name: {
                        type: String,
                        required: true,
                    },
                    contact_phone_number: {
                        type: Number,
                        required: true,
                    },
                    unit_number: {
                        type: Number,
                        required: true,
                    },
                    street: {
                        type: String,
                        required: true,
                    },
                    city: {
                        type: String,
                        required: true,
                    },
                    province: {
                        type: String,
                        required: true,
                    },
                    country: {
                        type: String,
                        required: true,
                    },
                    postal_code: {
                        type: String,
                        required: true,
                    },
                    instructions: {
                        type: String,
                        required: true,
                    },
                }
            }
        },
    },
})

module.exports = mongoose.model('returnProcess', returnProcessSchema);
