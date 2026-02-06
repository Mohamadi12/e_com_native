import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    // Récupérer l'utilisateur connecté
    const user = req.user;

    // Récupérer les informations envoyées par le client
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items" });
    }

    // Validation des produits et des stocks
    for (const item of orderItems) {
      // Vérifier que le produit existe dans la base
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.name} not found` });
      }

      // Vérifier que la quantité demandée est disponible
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    // Créer la commande dans la base
    const order = await Order.create({
      user: user._id,
      clerkId: user.clerkId,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
    });

    // update product stock (Pour chaque produit commandé, on réduit le stock dans la base de la quantité achetée)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserOrders(req, res) {
  try {
    // Récupérer toutes les commandes du client connecté, avec les informations complets du produit les plus recents
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // Vérifier si chaque commande a déjà été évaluée (review)
    const orderIds = orders.map((order) => order._id); // Extraire les IDs de toutes les commandes
    const reviews = await Review.find({ orderId: { $in: orderIds } }); // Récupérer toutes les reviews pour ces commandes
    const reviewedOrderIds = new Set(
      reviews.map((review) => review.orderId.toString()),
    ); // Créer un Set avec les IDs des commandes déjà évaluées pour un accès rapide

    // Ajouter le statut "hasReviewed" à chaque commande
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        };
      }),
    );

    res.status(200).json({ orders: ordersWithReviewStatus });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
