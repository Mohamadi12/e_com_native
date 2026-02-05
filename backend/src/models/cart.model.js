import mongoose from "mongoose";

//Objectif → Un produit dans le panier
const cartItemSchema = new mongoose.Schema({
  //L’ID du produit ajouté.
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  //La quantité commandée.
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

//Objectif → Le panier complet
const cartSchema = new mongoose.Schema(
  {
    //L’utilisateur propriétaire du panier.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //ID venant de Clerk (authentification)
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    //Liste des produits dans le panier.
    items: [cartItemSchema],
  },
  { timestamps: true },
);

export const Cart = mongoose.model("Cart", cartSchema);
