const stripe = require("express");
const express = require("stripe");

process.env.STRIPE_SECRET_KEY;

exports.charge = async (req, res) => {
  try {
    const { amount, source, receipt_email, promoCode } = req.body;
    let chargeAmount = amount;

    if (promoCode && promoCodes[promoCode]) {
      const promoDetails = promoCodes[promoCode];
      const discountPercentage = promoDetails.discountPercentage;
      const discountAmount = (amount * discountPercentage) / 100;
      chargeAmount -= discountAmount;
    }

    const charge = await stripe.charges.create({
      amount: chargeAmount,
      currency: "cad",
      source,
      receipt_email,
      metadata: {
        promoCode: promoCode || "No promo code applied",
      },
    });

    res.status(200).json({
      success: true,
      charge,
      discountApplied: promoCode ? true : false,
    });
  } catch (error) {
    console.error("Error charging the customer:", error.message);
    res.status(500).json({ error: error.message });
  }
};
