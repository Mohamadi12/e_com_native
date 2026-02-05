import mongoose from "mongoose";
//Objectif: Créer le schéma des avis
const reviewSchema = new mongoose.Schema(
  {
    //C’est l’ID du produit noté.
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    //ID de l’utilisateur qui a commenté.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //ID de la commande liée.
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    //La note ⭐
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);