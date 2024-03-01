const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
