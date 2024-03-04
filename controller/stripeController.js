require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PromoCode = require("../models/promocode");
const { v4: uuidv4 } = require("uuid");

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

class Order {
    constructor(id) {
        this.id = id; // references a common id: invoice id
        this.hasInvoiceSucceeded = false;
        this.hasCheckoutCompleted = false;
        this.data = {
            invoiceData: null,
            checkoutData: null,
        };
    }

    setInvoiceSucceeded(hasSucceded) {
        this.hasInvoiceSucceeded = hasSucceded;
    }

    setCheckoutCompleted(hasCompleted) {
        this.hasCheckoutCompleted = hasCompleted;
    }

    setCheckoutData(data) {
        this.data.checkoutData = data;
    }

    setInvoiceData(data) {
        this.data.invoiceData = data;
    }
}

// TODO (For scalability): Replace with queue based solution with Redis
// In-memory array to process purchases
// it is emptied once purchases have processed
const orders = [];

// Checks if the in-memory `orders` array contains
// an order with the inputted invoice id
function hasOrder(id) {
    return Boolean(orders.find((order) => order.id === id));
}

function getOrder(id) {
    return orders.find((order) => order.id === id);
}

function isOrderComplete(id) {
    if (hasOrder(id)) {
        const order = getOrder(id);
        return order.hasInvoiceSucceeded && order.hasCheckoutCompleted;
    }
    return false;
}

function removeOrder(id) {
    if (hasOrder(id)) {
        orders.splice(orders.indexOf(getOrder(id)));
        return true;
    }
    return false;
}

// Only for Bronze Plan, grabs the prices of additional boxes
function getAdditionalBoxPrice(products, prices) {
    const matchingProduct = products.find(
        (product) => product.name.toLowerCase() == "additional box"
    );
    const matchingPrice = prices.find(
        (price) => price.product === matchingProduct.id
    );

    return matchingPrice.id;
}

function saveConfirmedOrder(order) {
    console.log("SAVING DATA");
    console.log(order.data);

    // once completed, remove from in-memory array
    removeOrder(order.id);
}

exports.success = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log(`❌ Error message: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    const session = event.data.object;
    let order = null;
    switch (event.type) {
        // Grabs the invoice number
        case "invoice.payment_succeeded":
            if (!hasOrder(session.id)) {
                order = new Order(session.id);
                orders.push(order);
            } else {
                order = getOrder(session.id);
            }

            // Save the invoice number for saving into MongoDB
            order.setInvoiceData({
                invoiceNumber: session.number,
            });
            order.setInvoiceSucceeded(true);
            console.log("INVOICE PAYMENT SUCCEDED");
            if (isOrderComplete(order.id)) {
                saveConfirmedOrder(order);
            }
            break;
        // Grabs the metadata and client reference id sent from the request
        case "checkout.session.completed":
            if (!hasOrder(session.invoice)) {
                order = new Order(session.invoice);
                orders.push(order);
            } else {
                order = getOrder(session.invoice);
            }

            // Save the metadata for saving into MongoDB
            order.setCheckoutData({
                metadata: session.metadata,
                checkoutRefId: session.client_reference_id,
            });
            order.setCheckoutCompleted(true);
            console.log("CHECKOUT COMPLETED");
            if (isOrderComplete(order.id)) {
                saveConfirmedOrder(order);
            }
            break;
        default:
            // If needed, can handle other Stripe event types
            break;
    }

    res.status(200).json({ received: true });
};

exports.charge = async (req, res) => {
    const { order_details, discount, subscription } = req.body;

    const promoCode = discount?.promoCode ?? "";
    const matchingPromoCode = await PromoCode.findOne({ promoCode });

    const promoCodesRes = await stripe.coupons.list();
    const promoCodes = promoCodesRes.data;

    const productsRes = await stripe.products.list();
    const pricesRes = await stripe.prices.list();

    const products = productsRes.data;
    const prices = pricesRes.data;

    const matchingProduct = products.find(
        (product) =>
            product.name.toLowerCase() === subscription.type.toLowerCase()
    );
    const matchingPrice = prices.find(
        (price) => price.product === matchingProduct.id
    );

    const checkoutRefId = uuidv4();

    const session = await stripe.checkout.sessions.create({
        cancel_url: `http://localhost:3000/schedule-pickup?success=false`,
        client_reference_id: checkoutRefId,
        currency: "CAD",
        discounts: [
            {
                coupon:
                    promoCodes.find(
                        (promo) =>
                            promo.name.toLowerCase() == promoCode.toLowerCase()
                    )?.id ?? undefined,
            },
        ],
        invoice_creation: {
            enabled:
                matchingProduct.name.toLowerCase() == "bronze"
                    ? true
                    : undefined,
        },
        line_items: [
            {
                price: matchingPrice.id,
                quantity: 1,
            },
            order_details.extra_packages_included
                ? {
                      price: getAdditionalBoxPrice(products, prices),
                      quantity: order_details.extra_packages_included,
                  }
                : undefined,
        ],
        mode:
            subscription.type.toLowerCase() === "bronze"
                ? "payment"
                : "subscription",
        metadata: {
            promoCode: promoCode || undefined,
            subscription: JSON.stringify({
                type: subscription.type,
                expiryDate: subscription.expiryDate,
                price: matchingPrice.unit_amount,
            }),
            orderDetails: JSON.stringify({
                userId: order_details.pickup_details.user_id,
                totalPackages: String(order_details.total_packages),
                extraPackages: String(order_details.extra_packages_included),
                pickupDate: order_details.pickup_date,
                pickupMethod: order_details.pickup_method,
                pickupDetails: {
                    city: order_details.pickup_details.city,
                    name: order_details.pickup_details.contact_full_name,
                    phoneNumber:
                        order_details.pickup_details.contact_phone_number,
                    country: order_details.pickup_details.country,
                    instructions:
                        order_details.pickup_details.instructions ?? "",
                    postalCode: order_details.pickup_details.postal_code,
                    province: order_details.pickup_details.province,
                    address: order_details.pickup_details.street,
                    unit: order_details.pickup_details.unit_number ?? "",
                },
            }),
        },
        payment_method_types: ["card"],
        success_url: `http://localhost:3000/schedule-pickup?success=true&checkoutRefId=${checkoutRefId}`,
    });

    res.json({ id: session.id });
};

/**
 * things to save in the database
 * order id - checkout session id
 * order reference number - provided by stripe
 * order status - already done
 * order date
 * order_details
 * - total cost
 * - pickup date
 * - pickup method
 * - total packages
 * - extra packages
 * - promocode
 * - pickup_details
 * - - user (reference user model)
 * - - phone number
 * - - unit number
 * - - street
 * - - city
 * - - province
 * - - country
 * - - postal code
 * - - instructions
 */
