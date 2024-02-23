const express = require("express");
require("dotenv").config();
const connectToDatabase = require("./config/db");
const multer = require('multer');
const ReturnProcess = require('./models/ReturnProcess');
const uploadImage = require('./middleware/upload');
const path = require('path');
const authRouter = require("./routes/authRoute");
const orderRouter = require("./routes/ordersRoute");
const paymentRouter = require("./routes/paymentRoute");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app;
const port = process.env.PORT || 3000;

connectToDatabase();

app.post('/upload', uploadImage.single('file'), (req, res) => {
  const newImage = new File({ filename: req.file.originalname, path: req.file.path});
  newImage.save((err, file) => {
    if (err) {
      console.log(err);
      res.status(500).send('There was an error uploading your file');
    } else {
      res.status(200).send('File uploaded successfully');
    }
  });

  newImage.save()
    .then(() => res.json('Image uploaded!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// API routes
app.use("/api", authRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port # ${port}`);
});
