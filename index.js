const express = require("express");
require("dotenv").config();
const connectToDatabase = require("./config/db");
const authRouter = require("./routes/authRoute");
const orderRouter = require("./routes/ordersRoute");
const paymentRouter = require("./routes/paymentRoute");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app;
const port = process.env.PORT || 3000;

connectToDatabase();

// API routes
app.use("/api", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port # ${port}`);
});
