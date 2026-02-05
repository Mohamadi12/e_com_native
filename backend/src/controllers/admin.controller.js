import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

export async function createProduct(req, res) {
  try {
    // Récupérer les champs du formulaire depuis la requête
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Vérifier qu'au moins une image a été envoyée
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Vérifier qu'on ne dépasse pas 3 images maximum
    if (req.files.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images allowed" });
    }

    // Pour chaque image envoyée, créer une promesse d'upload vers Cloudinary
    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "products", // Dossier Cloudinary où stocker les images
      });
    });

    // Attendre que toutes les images soient uploadées
    const uploadResults = await Promise.all(uploadPromises);

    // Récupérer uniquement les URLs sécurisées des images pour les stocker en base
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // Créer le produit dans la base de données MongoDB
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price), // Convertir en nombre flottant
      stock: parseInt(stock), // Convertir en entier
      category,
      images: imageUrls, // Ajouter les URLs des images
    });

    // Répondre au client avec le produit créé
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllProducts(_, res) {
  try {
    // -1 means in desc order: most recent products first
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateProduct = async (req, res) => {
  try {
    // Récupérer l'id du produit depuis les paramètres de l'URL
    const { id } = req.params;
    // Récupérer les champs du corps de la requête (ce que l'utilisateur veut modifier)
    const { name, description, price, stock, category } = req.body;

    // Chercher le produit dans la base de données par son id
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Mettre à jour les champs du produit uniquement si l'utilisateur a fourni une nouvelle valeur
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price); // conversion en nombre
    if (stock !== undefined) product.stock = parseInt(stock); // conversion en entier
    if (category) product.category = category;

    // Gérer la mise à jour des images quand de nouvelles images sont envoyées.
    if (req.files && req.files.length > 0) {
      // Vérifier qu'on ne dépasse pas 3 images maximum
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maximum 3 images allowed" });
      }

      // Pour chaque nouvelle image, créer une promesse d'upload vers Cloudinary
      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "products", // Dossier Cloudinary
        });
      });

      // Attendre que toutes les images soient uploadées
      const uploadResults = await Promise.all(uploadPromises);

      // Remplacer les anciennes images par les nouvelles URLs sécurisées
      product.images = uploadResults.map((result) => result.secure_url);
    }

    // Sauvegarder le produit mis à jour dans la base de données
    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function getAllOrders(_, res) {
  try {
    // Chercher toutes les commandes dans la base de données
    const orders = await Order.find()
      .populate("user", "name email") // Remplace user par son nom et email au lieu de juste l’id.
      .populate("orderItems.product") // Remplace les ids des produits par toutes les infos du produit.
      .sort({ createdAt: -1 }); // Les commandes les plus récentes apparaissent en premier.

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error in getAllOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    // Récupérer ID de la commande
    const { orderId } = req.params;

    // Récupérer Nouveau statut
    const { status } = req.body;

    // Vérifier que le statut fourni est valide
    if (!["pending", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Chercher la commande dans la base de données par son id
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Mettre à jour le statut de la commande
    order.status = status;

    // Si le statut est "shipped" et que shippedAt n'existe pas encore
    // on ajoute la date actuelle pour savoir quand elle a été expédiée
    if (status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    // Si le statut est "delivered" et que deliveredAt n'existe pas encore
    // on ajoute la date actuelle pour savoir quand elle a été livrée
    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    // Sauvegarder les modifications dans la base de données
    await order.save();

    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find()
      // .populate("orders") // si tu veux lier les commandes aux clients
      .sort({ createdAt: -1 }); // récupère tous les clients dans MongoDB et affiche les plus recents
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDashboardStats(_, res) {
  try {
    // Compter le nombre total de commandes dans la base de données
    const totalOrders = await Order.countDocuments();

    // Calculer le chiffre d'affaires total (somme de totalPrice de toutes les commandes)
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null, // On ne regroupe pas par champ, juste une somme globale
          total: { $sum: "$totalPrice" }, // Somme de toutes les commandes
        },
      },
    ]);

    // Récupérer la valeur totale, si aucune commande → 0
    const totalRevenue = revenueResult[0]?.total || 0;

    const totalCustomers = await User.countDocuments(); // Compter le nombre total de clients
    const totalProducts = await Product.countDocuments(); // Compter le nombre total de produits

    // Envoyer toutes les statistiques au client
    res.status(200).json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteProduct = async (req, res) => {
  try {
    // Récupérer l'id du produit depuis les paramètres de l'URL
    const { id } = req.params;

    // Chercher le produit dans la base de données
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        // Extract public_id from URL (assumes format: .../products/publicId.ext)
        const publicId =
          "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
        if (publicId) return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises.filter(Boolean));
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
