import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createReview(req, res) {
  try {
    // Récupérer les infos envoyées par le client
    const { productId, orderId, rating } = req.body;

    // Vérifier que la note est valide (entre 1 et 5)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const user = req.user; // Utilisateur connecté

    // Vérifier que la commande existe
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Vérifier que la commande appartient à l'utilisateur
    if (order.clerkId !== user.clerkId) {
      return res
        .status(403)
        .json({ error: "Not authorized to review this order" });
    }

    // Vérifier que la commande est livrée avant de pouvoir la noter
    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ error: "Can only review delivered orders" });
    }

    // Vérifier que le produit est bien dans la commande
    const productInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId.toString(),
    );
    if (!productInOrder) {
      return res.status(400).json({ error: "Product not found in this order" });
    }

    // Créer ou mettre à jour la review (si l'utilisateur a déjà noté ce produit)
    const review = await Review.findOneAndUpdate(
      { productId, userId: user._id }, // Critères de recherche
      { rating, orderId, productId, userId: user._id }, // Valeurs à mettre à jour ou créer
      { new: true, upsert: true, runValidators: true }, // new = retourner le doc mis à jour, upsert = créer si inexistant
    );

    // update the product rating with atomic aggregation(// Recalculer la note moyenne du produit)
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        averageRating: totalRating / reviews.length, // nouvelle moyenne
        totalReviews: reviews.length, // nombre total de reviews
      },
      { new: true, runValidators: true },
    );

    // Sécurité : si le produit a été supprimé entre-temps, on supprime la review
    if (!updatedProduct) {
      await Review.findByIdAndDelete(review._id);
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error in createReview controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteReview(req, res) {
  try {
    // Récupérer l'ID de la review à supprimer depuis l'URL
    const { reviewId } = req.params;

    // Récupérer l'utilisateur connecté
    const user = req.user;

    // Chercher la review dans la base
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Vérifier que l'utilisateur est bien l'auteur de la review
    if (review.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this review" });
    }

    const productId = review.productId; // On garde l'ID du produit pour recalculer la note
    await Review.findByIdAndDelete(reviewId); // Supprimer la review

    // Recalculer la moyenne et le nombre total de reviews du produit
    const reviews = await Review.find({ productId }); // Toutes les reviews restantes
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0); // Somme des notes
    await Product.findByIdAndUpdate(productId, {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0, // nouvelle moyenne
      totalReviews: reviews.length, // nombre total de reviews
    });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
