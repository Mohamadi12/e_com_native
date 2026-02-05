import mongoose from "mongoose";

//Objectif => Un produit dans la commande => Chaque ligne = un orderItem
const orderItemSchema = new mongoose.Schema({
  //ID du produit original
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  //Nom du produit au moment de l’achat.
  name: {
    type: String,
    required: true,
  },
  //Prix au moment de l’achat.
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  //Quantité achetée.
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  //Image du produit (pour l’historique).
  image: {
    type: String,
    required: true,
  },
});

// Objectif => Adresse de livraison
const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
});
/*
fullName → Nom
streetAddress → Rue
city → Ville
state → Région
zipCode → Code postal
phoneNumber → Téléphone
*/

//Objectif: La commande complète
const orderSchema = new mongoose.Schema(
  {
    //Qui a commandé.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //ID Clerk (auth).
    clerkId: {
      type: String,
      required: true,
    },
    //Liste des produits achetés.
    orderItems: [orderItemSchema],
    //Adresse utilisée pour livrer.
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    //Infos du paiement 💳
    paymentResult: {
      id: String,
      status: String,
    },
    //Prix total à payer.
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    //État de la commande 📊
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    //Date de livraison.
    deliveredAt: {
      type: Date,
    },
    //Date d’envoi.
    shippedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
