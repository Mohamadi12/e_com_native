import mongoose from "mongoose";


//Objectif: Adresse utilisateur
const addressSchema = new mongoose.Schema({
  // Nom de l’adresse(Maison, bureau).
  label: {
    type: String,
    required: true,
  },
  // Nom complet du destinataire(Mohamed Traoré).
  fullName: {
    type: String,
    required: true,
  },
  //Adresse exacte(Secteur 15, Rue 45, Porte 12).
  streetAddress: {
    type: String,
    required: true,
  },
  //Ville.
  city: {
    type: String,
    required: true,
  },
  //Région / Province.
  state: {
    type: String,
    required: true,
  },
  //Code postal.
  zipCode: {
    type: String,
    required: true,
  },
  //Numéro de téléphone
  phoneNumber: {
    type: String,
    required: true,
  },
  //Où livrer automatiquement ? Si t'as mis Maison, Maman, Voiture
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      unique: true,
      required: true,
    },
    //Pour Stripe 💳 (paiement en ligne)
    stripeCustomerId: {
      type: String,
      default: "",
    },
    //Liste des adresses.
    addresses: [addressSchema],
    //Liste des produits favoris ❤️
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);


/*
{
  email: "mohamed@gmail.com",
  name: "Mohamed Traoré",
  imageUrl: "photo.png",
  clerkId: "user_12345",
  addresses: [
    {
      label: "Maison",
      fullName: "Mohamed Traoré",
      streetAddress: "Secteur 15",
      city: "Ouaga",
      state: "Kadiogo",
      zipCode: "00226",
      phoneNumber: "70123456",
      isDefault: true
    }
  ],
  wishlist: [
    "65ab...",
    "77cd..."
  ],
  createdAt: "...",
  updatedAt: "..."
}

*/