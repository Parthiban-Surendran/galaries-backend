import express from "express";
import prisma from "../db.js";

import Stripe from "stripe";

import cron from "node-cron";  // For scheduling tasks, install node-cron first

// productRoutes.js



import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();





// router.post("/", async (req, res) => {
//   const data = req.body;

//   try {
//     const product = await prisma.product.create({ data });

//     // Add to Algolia
//     await productIndex.saveObject({
//       objectID: product.id,
//       name: product.name,
//       description: product.description,
//       price: product.price,
//       categoryId: product.categoryId,
//     });

//     res.json(product);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.get("/search", async (req, res) => {
//   const { query } = req.query;

//   try {
//     const result = await productIndex.search(query);
//     res.json(result.hits);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });




// Get all products
router.get("/", async (req, res) => {
    try {
      // Check if categoryId is provided for filtering
      const { categoryId } = req.query;
  
      let products;
      if (categoryId) {
        products = await prisma.product.findMany({
          where: { categoryId: parseInt(categoryId) },
        });
      } else {
        products = await prisma.product.findMany();
      }
  
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  // router.get("/by-parent-category", async (req, res) => {
  //   const { parentCategoryId } = req.query;
    
  //   if (!parentCategoryId) {
  //     return res.status(400).json({ error: "Parent category ID is required" });
  //   }
  
  //   try {
  //     const categoryQueue = [Number(parentCategoryId)];
  //     const allCategoryIds = new Set();
  
  //     while (categoryQueue.length > 0) {
  //       const currentCategoryId = categoryQueue.shift();
        
  
  //       const category = await prisma.category.findUnique({
  //         where: { categoryId: currentCategoryId },
  //       });
  
  //       if (category && category.childIds.length > 0) {
  //         categoryQueue.push(...category.childIds);
  //       }
  //       else{
  //           categoryQueue.push(currentCategoryId)
  //           break;
  //       }
  //     }
  
  //     const products = await prisma.product.findMany({
  //       where: {
  //         categoryId: { in: Array.from(categoryQueue) },
  //       },
  //     });
  
  //     return res.json(products);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //     return res.status(500).json({ error: "Internal server error" });
  //   }
  // });


  router.get("/by-parent-category", async (req, res) => {
    const { parentCategoryId } = req.query;
  
    if (!parentCategoryId) {
      return res.status(400).json({ error: "Parent category ID is required" });
    }
  
    try {
      const categoryQueue = [Number(parentCategoryId)];
      const allCategoryIds = new Set();
  
      while (categoryQueue.length > 0) {
        const currentCategoryId = categoryQueue.shift();
  
        // Avoid re-visiting the same category
        if (allCategoryIds.has(currentCategoryId)) continue;
        allCategoryIds.add(currentCategoryId);
  
        const children = await prisma.categoryMapping.findMany({
          where: { parentId: currentCategoryId },
          select: { childId: true }
        });
  
        for (const child of children) {
          categoryQueue.push(child.childId);
        }
      }
  
      const products = await prisma.product.findMany({
        where: {
          categoryId: { in: Array.from(allCategoryIds) }
        },
        include: {
          category: true
        },
        orderBy: {
          productId: 'asc'
        }
      });
  
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

router.get('/top-products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      take: 4,
      include: {
        category: true, 
      },
      orderBy: {
        productId: 'asc', 
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/all-products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
   
      include: {
        category: true, 
      },
      orderBy: {
        productId: 'asc', 
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


  
  
  

// Create a new product
router.post("/", async (req, res) => {
  try {
    const { productName, price, brand, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { productName, price, brand, categoryId },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Add item to cart
// Add to cart (Create or update quantity)
router.post("/cart/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const existing = await prisma.cart.findFirst({
      where: {
        userId,
        productId,
      },
    });

    let cartItem;
    if (existing) {
      // Update quantity if already exists
      cartItem = await prisma.cart.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + (quantity || 1),
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart.create({
        data: {
          userId,
          productId,
          quantity: quantity || 1,
        },
      });
    }

    res.json(cartItem);
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ error: error.message });
  }
});


// Get user's cart
// router.get("/cart/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const cartItems = await prisma.cart.findMany({
//       where: { userId: parseInt(userId) },
//       include: { product: true },
//       orderBy: {
//         productId: 'asc', // or 'id': 'asc' if that's your primary key
//       },
//     });
    

//     const totalItems = cartItems.length;

//     res.json({
//       totalItems,
//       cartItems, // Flat, not nested inside 'items'
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


router.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId: parseInt(userId) },
      include: { product: true },
      orderBy: {
        productId: 'asc',
      },
    });

    const totalItems = cartItems.length;

    // Calculate total price
    const totalPrice = cartItems.reduce((acc, item) => {
      const price = item.product.discountedPrice || item.product.price || 0;
      return acc + price * item.quantity;
    }, 0);

    res.json({
      totalItems,
      totalPrice,
      cartItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Update quantity of a product in cart
router.put("/cart/update", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const existing = await prisma.cart.findFirst({
      where: { userId, productId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const updated = await prisma.cart.update({
      where: { id: existing.id },
      data: { quantity },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Remove a product from cart
router.delete("/cart/remove", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const existing = await prisma.cart.findFirst({
      where: { userId, productId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await prisma.cart.delete({
      where: { id: existing.id },
    });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});










const sendResponse = (res, { status, type, message, data = null }) => {
  res.status(status).json({ type, message, data });
};

// Create Stripe PaymentIntent
router.post("/payment/create-intent", async (req, res) => {
  const { totalAmount, currency = "usd",userId } = req.body;
  console.log(totalAmount)
  try {
    const customer = await stripe.customers.create({
      metadata: { userId: String(userId) },
    });
    console.log("check1")

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-12-18.acacia" }
    );
    console.log("check2")

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency,
      customer: customer.id,
      description: "ShopFlow Order Payment",
      metadata: { userId: String(userId) },
      automatic_payment_methods: { enabled: true },
    });
    console.log("check3")


    sendResponse(res, {
      status: 200,
      type: "success",
      message: "Payment Intent successfully created.",
      data: {
        paymentIntent: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        ephemeralKey: ephemeralKey.secret,
        customerId: customer.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      },
    });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    sendResponse(res, {
      status: 500,
      type: "error",
      message: "Failed to create PaymentIntent.",
      data: error.message,
    });
  }
});

// Retrieve Payment Method ID from PaymentIntent
router.get("/payment/method-id", async (req, res) => {
  const { paymentIntentId } = req.query;

  if (!paymentIntentId) {
    return sendResponse(res, {
      status: 400,
      type: "error",
      message: "Missing paymentIntentId in request.",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paymentMethodId = paymentIntent.payment_method;

    sendResponse(res, {
      status: 200,
      type: "success",
      message: "Payment Method ID retrieved.",
      data: { paymentMethodId },
    });
  } catch (error) {
    console.error("Error retrieving payment method ID:", error.message);
    sendResponse(res, {
      status: 500,
      type: "error",
      message: "Failed to retrieve payment method ID.",
      data: error.message,
    });
  }
});

// Confirm Payment (and update order status)
// router.post("/payment/confirm", async (req, res) => {
//   const { orderId, paymentIntentId } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (paymentIntent.status === "succeeded") {
//       // Update ordered items
//       await prisma.orderedItem.updateMany({
//         where: { orderId: parseInt(orderId) },
//         data: {
//           paymentStatus: "COMPLETED",
//           orderStatus: "CONFIRMED",
//         },
//       });

//       // Update order
//       const order = await prisma.order.update({
//         where: { id: parseInt(orderId) },
//         data: {
//           paymentStatus: "COMPLETED",
//           orderStatus: "CONFIRMED",
//           updatedAt: new Date() // ✅ manually setting updatedAt

//         },
//         include: { items: true },
//       });

//       sendResponse(res, {
//         status: 200,
//         type: "success",
//         message: "Payment confirmed and order updated.",
//         data: order,
//       });
//     } else {
//       sendResponse(res, {
//         status: 400,
//         type: "warning",
//         message: `Payment not confirmed. Current status: ${paymentIntent.status}`,
//       });
//     }
//   } catch (error) {
//     console.error("Error confirming payment:", error.message);
//     sendResponse(res, {
//       status: 500,
//       type: "error",
//       message: "Failed to confirm payment.",
//       data: error.message,
//     });
//   }
// });


// Confirm Payment (and update order status)
router.post("/payment/confirm", async (req, res) => {
  const { orderId, paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update ordered items
      await prisma.orderedItem.updateMany({
        where: { orderId: parseInt(orderId) },
        data: {
          paymentStatus: "COMPLETED",
          orderStatus: "PROCESSING", // Changed to 'PROCESSING'
        },
      });

      // Update order
      const order = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          paymentStatus: "COMPLETED",
          orderStatus: "PROCESSING", // Changed to 'PROCESSING'
          updatedAt: new Date(),
          processingDate: new Date(), // Optional: For tracking when the order was processed
        },
        include: { items: true },
      });

      sendResponse(res, {
        status: 200,
        type: "success",
        message: "Payment confirmed and order updated.",
        data: order,
      });
    } else {
      sendResponse(res, {
        status: 400,
        type: "warning",
        message: `Payment not confirmed. Current status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error.message);
    sendResponse(res, {
      status: 500,
      type: "error",
      message: "Failed to confirm payment.",
      data: error.message,
    });
  }
});


const mockUserId = 1; // Replace with req.user.id if JWT is used

// ✅ Create new order
async function updateOrderStatus() {
  const today = new Date();
  
  try {
    // Find all orders that need their status updated (status is not DELIVERED yet)
    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: "DELIVERED"
        },
      },
    });

    for (let order of orders) {
      const createdAt = order.createdAt;
      const timeElapsed = (today - createdAt) / (1000 * 60 * 60 * 24); // Time in days

      let updatedStatus = null;

      if (timeElapsed >= 3 && order.status !== "DELIVERED") {
        updatedStatus = "DELIVERED";  // Delivered after 3 days
      } else if (timeElapsed >= 2 && order.status !== "COMPLETED") {
        updatedStatus = "COMPLETED";  // Completed after 2 days
      } else if (timeElapsed >= 1 && order.status !== "SHIPPED") {
        updatedStatus = "SHIPPED";   // Shipped after 1 day
      }

      // Update the order status if it's time
      if (updatedStatus) {
        await prisma.order.update({
          where: { orderId: order.orderId },
          data: { status: updatedStatus },
        });

        console.log(`Order ${order.orderId} status updated to ${updatedStatus}`);
      }
    }
  } catch (error) {
    console.error("Error updating order status:", error);
  }
}

// Schedule the task to run every day (e.g., at midnight)
cron.schedule("0 0 * * *", updateOrderStatus);  // This will run every day at midnight

// Example routes for creating and getting orders (no changes here)
router.post("/order", async (req, res) => {
  const { items, address } = req.body;

  try {
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Validate address
    if (!address || typeof address !== 'object') {
      return res.status(400).json({ error: "Address must be an object" });
    }

    const { line1, city, state, zip } = address;
    
    // Check if all required address fields are present
    if (!line1 || !city || !state || !zip) {
      return res.status(400).json({ error: "All address fields (line1, city, state, zip) are required" });
    }

    // Concatenate the address fields into a single string
    const fullAddress = `${line1}, ${city}, ${state}, ${zip}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity; // Use optional chaining for safety
    }, 0);

    // Replace this with the actual authenticated user's ID
    const mockUserId = 1;

    // Generate mock paymentId (in real life, from payment gateway)
    const paymentId = crypto.randomBytes(8).toString('hex'); // e.g., "f4a7b8d1e5c2a9ff"

    // Generate tracking number (could be a UUID or custom pattern)
    const trackingNumber = `TRACK-${uuidv4().slice(0, 8).toUpperCase()}`; // e.g., "TRACK-1A2B3C4D"

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: mockUserId,
        totalAmount,
        status: "PROCESSING",
        deliveryAddress: fullAddress, // Pass the full address string
        paymentId,
        trackingNumber,
        items: {
          create: items.map(item => ({
            productId: item.productId, // Ensure productId exists in item
            quantity: item.quantity,
            price: parseFloat(item.product?.price) || 0, // Safely access price and fallback to 0 if not found
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    console.error("Create Order Error:", error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
});



// ✅ Get all orders by user
router.get("/orders", async (req, res) => {
  const userId = mockUserId; // Get user ID from JWT

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({ orders });
  } catch (error) {
    console.error("Get Orders Error:", error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Get a single order
// router.get("/order/:orderId", async (req, res) => {
//   const { orderId } = req.params;

//   try {
//     const order = await prisma.order.findUnique({
//       where: { orderId: parseInt(orderId) },
//       include: {
//         items: {
//           include: {
//             product: true
//           }
//         }
//       }
//     });

//     if (!order) return res.status(404).json({ error: "Order not found" });

//     res.json({ order });
//   } catch (error) {
//     console.error("Get Order Error:", error.message);
//     res.status(500).json({ error: "Failed to fetch order" });
//   }
// });




router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { orderId: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Extract required fields including trackingNumber, paymentId, and deliveryAddress
    const response = {
      orderId: order.orderId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber || null,
      paymentId: order.paymentId || null,
      deliveryAddress: order.deliveryAddress || null,
      items: order.items
    };

    res.json(response);
  } catch (error) {
    console.error("Get Order Error:", error.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});



// (Optional) ✅ Cancel   order
router.patch("/order/:orderId/cancel", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.update({
      where: { orderId: parseInt(orderId) },
      data: { status: "CANCELLED" }
    });

    res.json({ message: "Order cancelled", order });
  } catch (error) {
    console.error("Cancel Order Error:", error.message);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});
router.patch("/order/:orderId/complete", async (req, res) => {
  const { orderId } = req.params;

  try {
    const updatedOrder = await prisma.order.update({
      where: { orderId: parseInt(orderId) },
      data: { status: "COMPLETED" },
    });

    res.json({ message: "Order Completed", order: updatedOrder });
  } catch (error) {
    console.error("❌ Complete Order Error:", error.message);
    res.status(500).json({ error: "Failed to complete order" });
  }
});

router.get("/user/address", async (req, res) => {
  const userId = mockUserId;  // Replace with actual user logic, like from JWT

  try {
    const userAddresses = await prisma.userAddress.findMany({
      where: { userId: userId },
    });
    

    if (!userAddresses) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json({ address: userAddresses });
  } catch (error) {
    console.error("Error fetching user address:", error.message);
    res.status(500).json({ error: error.message});
  }
});


router.post("/user/address", async (req, res) => {
  const userId = mockUserId;  // Replace with actual user logic, like from JWT
  const { line1, city, state, zip } = req.body;

  // Check if all required fields are provided
  if (!line1 || !city || !state || !zip) {
    return res.status(400).json({ error: "All address fields are required." });
  }

  try {
    // Create a new address record in the database
    const newAddress = await prisma.userAddress.create({
      data: {
        userId: userId,
        line1: line1,
        city: city,
        state: state,
        zip: zip,
      },
    });

    // Respond with the newly created address
    res.status(201).json({ message: "Address saved successfully", address: newAddress });
  } catch (error) {
    console.error("Error saving user address:", error.message);
    res.status(500).json({ error: error.message });
  }
});


export default router;
