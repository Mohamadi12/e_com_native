import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

export async function getCart(req, res) {
  try {
    // Chercher le panier de l'utilisateur connecté (via clerkId) et on remplace les productId par les infos complètes des produits (nom, prix, etc.)
    let cart = await Cart.findOne({ clerkId: req.user.clerkId }).populate(
      "items.product",
    );

    // Si aucun panier n'existe pour cet utilisateur
    if (!cart) {
      const user = req.user;

      // Créer un nouveau panier vide pour l'utilisateur
      cart = await Cart.create({
        user: user._id,
        clerkId: user.clerkId,
        items: [],
      });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error in getCart controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addToCart(req, res) {
  try {
    // On récupère l’ID du produit et la quantité depuis la requête.(quantité=1 par defaut)
    const { productId, quantity = 1 } = req.body;

    // Vérifier que le produit existe et qu’il y a assez de stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Chercher le panier de l’utilisateur
    let cart = await Cart.findOne({ clerkId: req.user.clerkId });

    // Si aucun panier n’existe, en créer un nouveau
    if (!cart) {
      const user = req.user;

      cart = await Cart.create({
        user: user._id,
        clerkId: user.clerkId,
        items: [],
      });
    }

    // check if item already in the cart(Vérifier si le produit est déjà dans le panier)
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      // increment quantity by 1(Si déjà présent, augmenter la quantité de 1)
      const newQuantity = existingItem.quantity + 1;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
      existingItem.quantity = newQuantity;
    } else {
      // add new item(Sinon, ajouter un nouvel item au panier)
      cart.items.push({ product: productId, quantity });
    }

    // Sauvegarder le panier mis à jour
    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error in addToCart controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateCartItem(req, res) {
  try {
    const { productId } = req.params; // On récupère l’ID du produit depuis l’URL
    const { quantity } = req.body; // On récupère la nouvelle quantité depuis le corps de la requête

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ clerkId: req.user.clerkId }); // On récupère le panier de l’utilisateur via son clerkId
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    ); // On cherche l’index du produit dans le panier
    // Si produit non trouvé → erreur “Item not found in cart”.
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // check if product exists & validate stock (Vérifier que le produit existe et qu’il y a assez de stock)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    //Met à jour la quantité du produit dans le panier et sauvegarde le panier.
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error in updateCartItem controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { productId } = req.params; // On récupère l’ID du produit depuis l’URL

    const cart = await Cart.findOne({ clerkId: req.user.clerkId }); // On récupère le panier de l’utilisateur via son clerkId
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Retirer l'item correspondant du panier
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error in removeFromCart controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const clearCart = async (req, res) => {
  try {
    // On récupère le panier de l’utilisateur via son clerkId.
    const cart = await Cart.findOne({ clerkId: req.user.clerkId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Vider tous les items du panier et sauvegarder le panier
    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (error) {
    console.error("Error in clearCart controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
