// const uuid = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_API_SECRET);
const SSLCommerzPayment = require("sslcommerz");
const Order = require('../models/orderSchema');
const AppError = require('../error_handler/AppError');
const wrapAsync = require('../error_handler/AsyncError');
const Product = require('../models/productSchema');
const { v4: uuidv4 } = require("uuid");
require('dotenv').config()
// to place an order
const newOrder = wrapAsync(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;
  console.log(
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount
  );
  if (
    !shippingInfo ||
    !orderItems ||
    !paymentMethod ||
    // !paymentInfo ||
    !itemsPrice ||
    !taxPrice ||
    !shippingCharges ||
    !totalAmount
  ) {
    return next(new AppError('some of the input fields is missing', 401));
  }

  await Order.create({
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
    user: req.rootUser._id,
  });
  for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].product);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }

  res.status(201).json({
    success: true,
    message: 'Order Placed Successfully',
  });
});

const getAdminOrders = wrapAsync(async (req, res, next) => {
  const orders = await Order.find({});

  res.status(200).json({
    success: true,
    orders,
  });
});

const getMyOrders = wrapAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.rootUser._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

const getSingleOrder = wrapAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new AppError('Order Not Found', 404));

  res.status(200).json({
    success: true,
    order,
  });
});

const proccessOrder = wrapAsync(async (req, res, next) => {
  const order = await Order.findById(req.params._id);
  if (!order) return next(new AppError('Order Not Found', 404));

  if (order.orderStatus === 'Preparing') order.orderStatus = 'Shipped';
  else if (order.orderStatus === 'Shipped') {
    order.orderStatus = 'Delivered';
    order.deliveredAt = new Date(Date.now());
  } else return next(new AppError('Order Already Delivered', 400));

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order Processed Successfully',
  });
});


const processPayment = wrapAsync(async (req, res, next) => {
  // const { totalAmount } = req.body;
 
  // const { client_secret } = await stripe.paymentIntents.create({
  //   amount: Number(totalAmount),
  //   currency: 'usd',
  // });
  // console.log(client_secret);
  // res.status(200).json({
  //   success: true,
  //   client_secret,
  // });
  const {
    shippingInfo,
    cartItems,
    selectedPaymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
    userId 
  
  
  } =req.body;
  console.log(req.body);
  try {
    const data = {
      total_amount:totalAmount,
      currency: "BDT",
      tran_id: uuidv4(),
      success_url: "http://localhost:5000/v2/api/user/success",
      fail_url: "http://localhost:5000/v2/api/user/fail",
      cancel_url: "http://localhost:5000/v2/api/user/cancel",
      ipn_url: "http://yoursite.com/ipn",
      payment: false,
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic", 
      product_profile: "general",
      cus_name: "Customer Name",
      cus_email: "cust@yahoo.com",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01711111111",
      cus_fax: "01711111111",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
      multi_card_name: "mastercard",
      value_a: "ref001_A",
      value_b: "ref002_B",
      value_c: "ref003_C",
      value_d: "ref004_D",
    };

    
    const newOrder = await Order.create({
      shippingInfo,
      cartItems,
      selectedPaymentMethod,
      itemsPrice,
      taxPrice,
      shippingCharges,
      totalAmount,
      user:userId, 
      tran_id:data.tran_id,
      payment:false,
      paymentInfo:{
        id:data.tran_id,
        status:"false"
      }

    });
    
    await newOrder.save();

    const sslcommer = new SSLCommerzPayment(
      process.env.SSL_STORE_ID,
      process.env.SSL_SECRET_KEY,
      false
    ); //true for live default false for sandbox
    sslcommer.init(data).then((data) => {
      //process the response that got from sslcommerz
      //https://developer.sslcommerz.com/doc/v4/#returned-parameters
      // console.log(data);
      if (data.GatewayPageURL) {
        res.status(200).send({ paymentUrl: data.GatewayPageURL });
      } else {
        res.status(200).send({
          error: "SSL session was not successful",
        });
      }
    });




  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      success: false,
      error,
    });
  }




});

module.exports = {
  newOrder,
  getAdminOrders,
  getSingleOrder,
  processPayment,
  proccessOrder,
  getMyOrders,
};
