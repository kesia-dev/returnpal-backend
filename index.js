const express = require("express");
require("dotenv").config();
const connectToDatabase = require("./config/db");
const authRouter = require("./routes/authRoute");
const orderRouter = require("./routes/ordersRoute");
const paymentRouter = require("./routes/paymentRoute");
const uploadRouter = require("./routes/uploadRoute");
const confirmPickupRouter = require("./routes/confirmPickupRoute");
const subscriptionRouter = require("./routes/subscriptionRoute");
const promocode = require("./routes/promocodeRoute");
const sendMail = require("./routes/sendMailRoute");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app;

const port = process.env.PORT || 3000;

connectToDatabase();

// API routes
app.use("/api", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/confirm-pickup", confirmPickupRouter);
app.use("/api/choose-plan", subscriptionRouter);
app.use("/api/promocode", promocode);
app.use("/api/sendmail", sendMail);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port # ${port}`);
});
