const Order = require("../models/orders");

exports.getOrders = async (req, res) => {
  const pageSize = 20;
  const page = parseInt(req.query.page) || 1;
  try {
    const skip = (page - 1) * pageSize;
    const orders = await Order.find({}).skip(skip).limit(pageSize);
    const totalOrdersCount = await Order.countDocuments({});
    const totalPages = Math.ceil(totalOrdersCount / pageSize);
    res.status(200).json({
      paginatedOrders: orders,
      currentPage: page,
      totalPages,
      totalOrders: totalOrdersCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const newOrder = req.body;
    const order = await Order.create(newOrder);
    res
      .status(200)
      .json({ message: "Order created successfully", id: order._id });
  } catch (error) {
    res.status(500).json({ message: "Error processing request", error });
  }
};
