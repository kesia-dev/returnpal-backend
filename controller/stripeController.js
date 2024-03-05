const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PromoCode = require("../models/promocode");
const { v4: uuidv4 } = require("uuid");
const { ConfirmOrder } = require('../models/returnProcessSchema');
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
  const { amount, receipt_email, promoCode } = req.body;
  let chargeAmount = amount;

  if (promoCode && promoCodes[promoCode]) {
    const promoDetails = promoCodes[promoCode];
    const discountPercentage = promoDetails.discountPercentage;
    const discountAmount = (amount * discountPercentage) / 100;
    chargeAmount -= discountAmount;
  }

  const product = await stripe.products.create({
    name: "P1",
  });

  const price = await stripe.prices.create({
    unit_amount: chargeAmount * 100,
    currency: "cad",
    product: product.id,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      promoCode: promoCode || "No promo code applied",
    },
    success_url: `http://localhost:3000`,
    cancel_url: `http://localhost:3000//schedule-pickup`,
  });

  res.json({ id: session.id });
};

exports.getOrderDetails  = async (req, res) => {
  try {
    const  {orderRef}  = req.body;
    const result = await ConfirmOrder.findOne({ orderRef:orderRef });
    console.log(result)
    res.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
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
