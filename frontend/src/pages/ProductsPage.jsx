import { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  ImageIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../lib/api";
import { getStockStatusBadge } from "../lib/utils";

const ProductsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const queryClient = useQueryClient();

  // fetch some data
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll,
  });

  // creating, update, deleting
  const createProductMutation = useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: productApi.update,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const closeModal = () => {
    // reset the state
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    });
    setImagePreviews(product.images);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) return alert("Maximum 3 images allowed");

    // revoke previous blob URLs to free memory
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // for new products, require images
    if (!editingProduct && imagePreviews.length === 0) {
      return alert("Please upload at least one image");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);

    // only append new images if they were selected
    if (images.length > 0)
      images.forEach((image) => formDataToSend.append("images", image));

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct._id,
        formData: formDataToSend,
      });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-base-content/70 mt-1">
            Gérer votre stock de produits
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Ajouter un produit
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 gap-4">
        {products?.map((product) => {
          const status = getStockStatusBadge(product.stock);

          return (
            <div key={product._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-6">
                  {/* IMAGE */}
                  <div className="avatar">
                    <div className="w-20 rounded-xl">
                      <img src={product.images[0]} alt={product.name} />
                    </div>
                  </div>

                  {/* INFOS */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="card-title">{product.name}</h3>
                        <p className="text-base-content/70 text-sm">
                          {product.category}
                        </p>
                      </div>
                      <div className={`badge ${status.class}`}>
                        {status.text}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-xs text-base-content/70">Prix</p>
                        <p className="font-bold text-lg">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/70">Stock</p>
                        <p className="font-bold text-lg">
                          {product.stock} unités
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="card-actions">
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => handleEdit(product)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="btn btn-square btn-ghost text-error"
                      onClick={() => deleteProductMutation.mutate(product._id)}
                    >
                      {deleteProductMutation.isPending ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <Trash2Icon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}

      <input type="checkbox" className="modal-toggle" checked={showModal} />

      <div className="modal">
        <div className="modal-box max-w-2xl">
          {/* HEADER MODAL */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl">
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
            </h3>

            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NOM + CATEGORIE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Nom du produit</span>
                </label>

                <input
                  type="text"
                  placeholder="Entrez le nom du produit"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Catégorie</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Choisir une catégorie</option>
                  <option value="Electronics">Électroniques</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Fashion">Mode</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            {/* PRIX + STOCK */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span>Prix ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input input-bordered"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span>Stock</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-control flex flex-col gap-2">
              <label className="label">
                <span>Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Description du produit"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* IMAGES */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images du produit
                </span>
                <span className="label-text-alt text-xs opacity-60">
                  Maximum 3 images
                </span>
              </label>

              <div className="bg-base-200 rounded-xl p-4 border-2 border-dashed border-base-300 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required={!editingProduct}
                />

                {editingProduct && (
                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    Laisser vide pour conserver les images actuelles
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="avatar">
                      <div className="w-20 rounded-lg">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                Annuler
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending
                }
              >
                {createProductMutation.isPending ||
                updateProductMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingProduct ? (
                  "Mettre à jour"
                ) : (
                  "Ajouter"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
