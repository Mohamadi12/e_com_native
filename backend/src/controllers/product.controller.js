import { Product } from "../models/product.model.js";

export async function getProductById(req, res) {
  try {
    // Récupérer l'ID du produit depuis l'URL
    const { id } = req.params;

    // Chercher le produit dans la base de données
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Sinon, renvoyer le produit trouvé
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
