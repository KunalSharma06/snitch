import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockofVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";
const { createOrder } = await import('../services/payment.service.js');
import { getCartDetails } from "../dao/cart.dao.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../config/config.js";
import { emailService } from "../services/email.service.js";
import userModel from "../models/user.model.js";

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    })
  }

  const stock = await stockofVariant(productId, variantId);

  const cart = (await cartModel.findOne({
    user: req.user._id,
  })) || (await cartModel.create({ user: req.user._id }));

  const productAlready = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId);

  if (productAlready) {
    const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId).quantity;

    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items left in stock. and you already have ${quantityInCart} in cart`,
        success: false,
      })
    }

    const updatedCart = await cartModel.findOneAndUpdate(
      { user: req.user._id, "items.product": productId, "items.variant": variantId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );

    let finalCart = await getCartDetails(req.user._id);
    if (!finalCart) {
      finalCart = {
        _id: updatedCart._id,
        user: updatedCart.user,
        items: [],
        totalPrice: 0,
        currency: "INR",
      };
    }

    return res.status(200).json({
      message: "Cart updated successfully",
      success: true,
      cart: finalCart,
    });
  }

  if (quantity > stock) {
    return res.status(400).json({
      message: `Only ${stock} items left in stock`,
      success: false,
    })
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price
  });

  await cart.save();

  let finalCart = await getCartDetails(req.user._id);
  if (!finalCart) {
    finalCart = {
      _id: cart._id,
      user: cart.user,
      items: [],
      totalPrice: 0,
      currency: "INR",
    };
  }

  return res.status(200).json({
    message: "Product added to cart successfully",
    success: true,
    cart: finalCart,
  });
}

export const getCart = async (req, res) => {
  const user = req.user;

  let cart = await getCartDetails(user._id);

  if (!cart) {
    cart = await cartModel.create({ user: user._id });
  }

  return res.status(200).json({
    message: "Cart fetched successfully",
    success: true,
    cart,
  });
}

export const incrementCartItemQuantity = async (req, res) => {
  const { productId, variantId } = req.params;
  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    });
  }

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(400).json({
      message: "Cart not found",
      success: false,
    });
  }

  const stock = await stockofVariant(productId, variantId);

  const itemQuantityInCart =
    cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    )?.quantity || 0;

  if (itemQuantityInCart + 1 > stock) {
    return res.status(400).json({
      message: `Only ${stock} items left in stock, you already have ${itemQuantityInCart} in cart`,
      success: false,
    });
  }

  const updatedCart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "items.product": productId,
      "items.variant": variantId,
    },
    { $inc: { "items.$.quantity": 1 } },
    { new: true },
  );

  let finalCart = await getCartDetails(req.user._id);
  if (!finalCart) {
    finalCart = {
      _id: updatedCart._id,
      user: updatedCart.user,
      items: [],
      totalPrice: 0,
      currency: "INR",
    };
  }

  return res.status(200).json({
    message: "Cart item quantity incremented successfully",
    success: true,
    cart: finalCart,
  });
};

export const decrementCartItemQuantity = async (req, res) => {
  const { productId, variantId } = req.params;
  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    });
  }

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(400).json({
      message: "Cart not found",
      success: false,
    });
  }

  const itemInCart = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId,
  );

  if (!itemInCart) {
    return res.status(404).json({
      message: "Item not found in cart",
      success: false,
    });
  }

  if (itemInCart.quantity <= 1) {
    return res.status(400).json({
      message: "Quantity cannot be less than 1",
      success: false,
    });
  }

  const updatedCart = await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "items.product": productId,
      "items.variant": variantId,
    },
    { $inc: { "items.$.quantity": -1 } },
    { new: true },
  );

  let finalCart = await getCartDetails(req.user._id);
  if (!finalCart) {
    finalCart = {
      _id: updatedCart._id,
      user: updatedCart.user,
      items: [],
      totalPrice: 0,
      currency: "INR",
    };
  }

  return res.status(200).json({
    message: "Cart item quantity decremented successfully",
    success: true,
    cart: finalCart,
  });
};

export const removeFromCart = async (req, res) => {
  const { productId, variantId } = req.params;

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found", success: false });
  }

  cart.items = cart.items.filter(
    (item) =>
      !(item.product.toString() === productId &&
        item.variant?.toString() === variantId)
  );

  await cart.save();

  let finalCart = await getCartDetails(req.user._id);
  if (!finalCart) {
    finalCart = {
      _id: cart._id,
      user: cart.user,
      items: [],
      totalPrice: 0,
      currency: "INR",
    };
  }

  return res.status(200).json({
    message: "Item removed from cart",
    success: true,
    cart: finalCart,
  });
};

export const createOrderController = async (req, res) => {
  const { addressId, paymentMethod } = req.body;
  console.log("Received:", { addressId, paymentMethod });
  console.log("User addresses:", req.user.addresses);

  const cart = await getCartDetails(req.user._id);

  if (!cart || !cart.items?.length) {
    return res.status(400).json({
      message: "Cart is empty",
      success: false,
    });
  }

  // Find the selected address from the user's saved addresses
  const user = req.user;
  const selectedAddress = user.addresses.id(addressId);

  if (!selectedAddress) {
    return res.status(400).json({
      message: "Please select a valid delivery address",
      success: false,
    });
  }

  const addressSnapshot = {
    fullName: selectedAddress.fullName,
    phone: selectedAddress.phone,
    line1: selectedAddress.line1,
    line2: selectedAddress.line2,
    city: selectedAddress.city,
    state: selectedAddress.state,
    pincode: selectedAddress.pincode,
  };

  const orderItems = cart.items.map((item) => ({
    title: item.product.title,
    productId: item.product._id,
    variantId: item.variant,
    quantity: item.quantity,
    images: item.product.variants.images || item.product.images,
    description: item.product.description,
    price: {
      amount:
        item.product.variants.discountedPrice?.amount ||
        item.product.variants.price.amount ||
        item.product.price.amount,
      currency:
        item.product.variants.price.currency || item.product.price.currency,
    },
  }));

  // Cash on Delivery — no Razorpay order needed
  if (paymentMethod === "cod") {
    const payment = await paymentModel.create({
      user: req.user._id,
      status: "cod_pending",
      paymentMethod: "cod",
      address: addressSnapshot,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      price: {
        amount: cart.totalPrice,
        currency: cart.currency,
      },
      orderItems,
    });

     await cartModel.findOneAndUpdate(
       { user: req.user._id },
       { $set: { items: [] } },
     );

    emailService.sendOrderConfirmationEmail(req.user.email, req.user.fullName, payment);

    return res.status(200).json({
      message: "Order placed successfully (Cash on Delivery)",
      success: true,
      codOrder: true,
      payment,
    });
  }

  // Razorpay flow (unchanged from your original)
  const order = await createOrder({ amount: cart.totalPrice, currency: "INR" });

  const payment = await paymentModel.create({
    user: req.user._id,
    razorpay: {
      orderId: order.id,
    },
    paymentMethod: "razorpay",
    address: addressSnapshot,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    price: {
      amount: cart.totalPrice,
      currency: cart.currency,
    },
    orderItems,
  });

  return res.status(200).json({
    message: "Order created successfully",
    success: true,
    order,
  });
};

export const verifyOrderController = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const payment = await paymentModel.findOne({
    "razorpay.orderId": razorpay_order_id,
    status: "pending",
  });

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found",
      success: false,
    });
  }

  const isPaymentValid = validatePaymentVerification(
    {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    },
    razorpay_signature,
    config.RAZORPAY_KEY_SECRET,
  );

  if (!isPaymentValid) {
    payment.status = "failed";
    await payment.save();

    return res.status(400).json({
      message: "Payment verification failed",
      success: false,
    });
  }

  payment.status = "paid";
  payment.razorpay.paymentId = razorpay_payment_id;
  payment.razorpay.signature = razorpay_signature;
  await payment.save();

  await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true },
  );

   emailService.sendOrderConfirmationEmail(req.user.email, req.user.fullName, payment);


  return res.status(200).json({
    message: "Payment verified successfully",
    success: true,
    payment,
  });
};


export const getUserOrders = async (req, res) => {
  try {
    const orders = await paymentModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await paymentModel.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const hoursSinceOrder = (Date.now() - order.createdAt) / (1000 * 60 * 60);
    if (hoursSinceOrder > 24) {
      return res.status(400).json({
        message: "Cancellation window has expired (24 hours).",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.status = "cancelled";
    order.fulfillmentStatus = "cancelled";
    await order.save();

     emailService.sendOrderCancellationEmail(req.user.email, req.user.fullName, order);


    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error cancelling order" });
  }
};

export const getAllOrders = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  try {
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { "address.fullName": { $regex: search, $options: "i" } },
        { "address.phone": { $regex: search, $options: "i" } },
        { _id: mongoose.Types.ObjectId.isValid(search) ? search : null },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      paymentModel
        .find(filter)
        .populate("user", "fullName email contact")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      paymentModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "paid",
    "failed",
    "cod_pending",
    "cod_delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const order = await paymentModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // Notify customer if admin marks a COD order as delivered
    if (status === "cod_delivered" && previousStatus !== "cod_delivered") {
      const user = await userModel.findById(order.user);
      if (user) {
        // Optional: could add a sendOrderDeliveredEmail here later
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating order status" });
  }
};

export const getAdminOrderStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, statusCounts, fulfillmentCounts] =
      await Promise.all([
        paymentModel.countDocuments({}),
        paymentModel.aggregate([
          { $match: { status: { $in: ["paid", "cod_pending"] } } },
          { $group: { _id: null, total: { $sum: "$price.amount" } } },
        ]),
        paymentModel.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        paymentModel.aggregate([
          { $group: { _id: "$fulfillmentStatus", count: { $sum: 1 } } },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusCounts: statusCounts.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {},
      ),
      fulfillmentCounts: fulfillmentCounts.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {},
      ),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching stats" });
  }
};

export const updateFulfillmentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { fulfillmentStatus } = req.body;

    console.log("UPDATE FULFILLMENT:", orderId, fulfillmentStatus);

  const validStatuses = ["processing", "shipped", "out_for_delivery", "delivered", "cancelled"];

  if (!validStatuses.includes(fulfillmentStatus)) {
    return res.status(400).json({ message: "Invalid fulfillment status" });
  }

  try {
    const order = await paymentModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.fulfillmentStatus = fulfillmentStatus;

    // Cancelling fulfillment also cancels the order overall
    if (fulfillmentStatus === "cancelled") {
      order.status = "cancelled";
    }

    await order.save();

    const io = req.app.get("io");
    io.to(order.user.toString()).emit("orderStatusUpdated", {
      orderId: order._id.toString(),
      fulfillmentStatus: order.fulfillmentStatus,
      status: order.status,
    });

    return res.status(200).json({
      success: true,
      message: "Fulfillment status updated",
      order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating fulfillment status" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { range = "30" } = req.query; // days: 7, 30, 90
    const days = Number(range);

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(
      now.getTime() - days * 2 * 24 * 60 * 60 * 1000,
    );

    const buildRevenueMatch = (start, end) => ({
      createdAt: { $gte: start, $lt: end },
      status: { $in: ["paid", "cod_pending"] },
    });

    const [
      currentRevenue,
      previousRevenue,
      currentOrderCount,
      previousOrderCount,
      revenueByDay,
      ordersByFulfillment,
      topProducts,
      signupsByDay,
      currentSignups,
      previousSignups,
    ] = await Promise.all([
      paymentModel.aggregate([
        { $match: buildRevenueMatch(periodStart, now) },
        { $group: { _id: null, total: { $sum: "$price.amount" } } },
      ]),
      paymentModel.aggregate([
        { $match: buildRevenueMatch(previousPeriodStart, periodStart) },
        { $group: { _id: null, total: { $sum: "$price.amount" } } },
      ]),
      paymentModel.countDocuments(buildRevenueMatch(periodStart, now)),
      paymentModel.countDocuments(
        buildRevenueMatch(previousPeriodStart, periodStart),
      ),
      paymentModel.aggregate([
        { $match: buildRevenueMatch(periodStart, now) },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$price.amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      paymentModel.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        { $group: { _id: "$fulfillmentStatus", count: { $sum: 1 } } },
      ]),
      paymentModel.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.title",
            totalSold: { $sum: "$orderItems.quantity" },
            revenue: {
              $sum: {
                $multiply: ["$orderItems.quantity", "$orderItems.price.amount"],
              },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      userModel.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      userModel.countDocuments({ createdAt: { $gte: periodStart } }),
      userModel.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: periodStart },
      }),
    ]);

    const currentRev = currentRevenue[0]?.total || 0;
    const prevRev = previousRevenue[0]?.total || 0;
    const revenueChange =
      prevRev === 0
        ? currentRev > 0
          ? 100
          : 0
        : ((currentRev - prevRev) / prevRev) * 100;

    const orderChange =
      previousOrderCount === 0
        ? currentOrderCount > 0
          ? 100
          : 0
        : ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100;

    const signupChange =
      previousSignups === 0
        ? currentSignups > 0
          ? 100
          : 0
        : ((currentSignups - previousSignups) / previousSignups) * 100;

    const avgOrderValue =
      currentOrderCount > 0 ? currentRev / currentOrderCount : 0;

    return res.status(200).json({
      success: true,
      range: days,
      revenue: {
        current: currentRev,
        change: Math.round(revenueChange * 10) / 10,
      },
      orders: {
        current: currentOrderCount,
        change: Math.round(orderChange * 10) / 10,
      },
      signups: {
        current: currentSignups,
        change: Math.round(signupChange * 10) / 10,
      },
      avgOrderValue: Math.round(avgOrderValue),
      revenueByDay,
      ordersByFulfillment,
      topProducts,
      signupsByDay,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching analytics" });
  }
};

// export const createOrderController = async (req, res) => {

//   const cart = await getCartDetails(req.user._id);

//   if (!cart) {
//     return res.status(400).json({
//       message: "Cart is empty",
//       success: false,
//     })
//   }

//   const order = await createOrder({ amount: cart.totalPrice, currency: 'INR' });

//   const payment = await paymentModel.create({
//     user: req.user._id,
//     razorpay: {
//       orderId: order.id,
//     },
//     price: {
//       amount: cart.totalPrice,
//       currency: cart.currency,
//     },
//     orderItems: cart.items.map(item => ({
//       title: item.product.title,
//       productId: item.product._id,
//       variantId: item.variant,
//       quantity: item.quantity,
//       images: item.product.variants.images || item.product.images,
//       description: item.product.description,
//       price: {
//         amount: item.product.variants.price.amount || item.product.price.amount,
//         currency: item.product.variants.price.currency || item.product.price.currency,
//       },
//     }))
//   })

//   return res.status(200).json({
//     message: "Order created successfully",
//     success: true,
//     order,
//   });
// }

// export const verifyOrderController = async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   const payment = await paymentModel.findOne({ "razorpay.orderId": razorpay_order_id, status: "pending" });

//   if (!payment) {
//     return res.status(404).json({
//       message: "Payment not found",
//       success: false,
//     });
//   }

//   const isPaymentValid = validatePaymentVerification({
//     order_id: razorpay_order_id,
//     payment_id: razorpay_payment_id,
//   }, razorpay_signature, config.RAZORPAY_KEY_SECRET);

//   if (!isPaymentValid) {
//     payment.status = "failed";
//     await payment.save();

//     return res.status(400).json({
//       message: "Payment verification failed",
//       success: false,
//     });
//   }

//   payment.status = "paid";
//   payment.razorpay.paymentId = razorpay_payment_id;
//   payment.razorpay.signature = razorpay_signature;
//   await payment.save();

//   return res.status(200).json({
//     message: "Payment verified successfully",
//     success: true,
//     payment,
//   });
  
// }