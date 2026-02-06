import { User } from "../models/user.model.js";

export async function addAddress(req, res) {
  try {
    // Récupérer les informations de l’adresse envoyées par le client
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    // Récupérer l’utilisateur connecté (via middleware d’authentification)
    const user = req.user;

    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    // Si la nouvelle adresse est définie comme "par défaut",
    // alors on enlève le statut par défaut des autres adresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Ajouter la nouvelle adresse
    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault: isDefault || false, // Si isDefault est vide → false par défaut
    });

    // Sauvegarder les changements dans MongoDB
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in addAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAddresses(req, res) {
  try {
    const user = req.user;

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error in getAddresses controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateAddress(req, res) {
  try {
    // Récupérer les nouvelles informations envoyées par le client
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    // Récupérer l’ID de l’adresse depuis l’URL
    const { addressId } = req.params;

    // Récupérer l’utilisateur connecté (via middleware d’authentification)
    const user = req.user;

    // Récupérer l’adresse à modifier
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Si cette adresse devient principale,
    // on enlève "par défaut" sur toutes les autres
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Mettre à jour seulement ce qui change
    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber || address.phoneNumber;

    // Cas spécial pour Boolean (true / false)
    // On vérifie s’il est défini avant de modifier
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    // Sauvegarder les modifications dans MongoDB
    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in updateAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteAddress(req, res) {
  try {
    //Récupérer l’adresse à supprimer
    const { addressId } = req.params;

    // Récupérer l’utilisateur connecté
    const user = req.user;

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Supprimer l’adresse dont l’ID correspond à addressId
    // pull() enlève automatiquement l’élément du tableau
    user.addresses.pull(addressId);

    // Sauvegarder les changements dans MongoDB
    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error in deleteAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Fonction pour ajouter un produit à la wishlist (liste de favoris)
export async function addToWishlist(req, res) {
  try {
    //Récupérer le produit depuis le corps de la requête
    const { productId } = req.body;

    // Récupérer l’utilisateur connecté
    const user = req.user;

    // Vérifier si le produit est déjà dans la wishlist (eviter les doublons)
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    // Ajouter le produit à la wishlist
    user.wishlist.push(productId);

    // Sauvegarder dans la base de données
    await user.save();

    res
      .status(200)
      .json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error in addToWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//Enlever un produit de sa wishlist (liste de favoris)
export async function removeFromWishlist(req, res) {
  try {
    //Récupérer l’ID du produit depuis l’URL
    const { productId } = req.params;

    // Récupérer l’utilisateur connecté
    const user = req.user;

    // check if product is already in the wishlist(Supprimer quelque chose qui n’existe pas)
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product not found in wishlist" });
    }

    // Enlever le produit de la wishlist (pull() = enlève du tableau...)
    user.wishlist.pull(productId);

    // Sauvegarder dans la base de données
    await user.save();

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in removeFromWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//Récupérer tous les produits que l’utilisateur a mis en favori (wishlist)
// populate = remplir la wishlist avec les détails des produits
export async function getWishlist(req, res) {
  try {
    // we're using populate, bc wishlist is just an array of product ids (// Remplace les IDs des produits par les vraies infos (nom, prix, image) pour pouvoir afficher la wishlist)
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Error in getWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
