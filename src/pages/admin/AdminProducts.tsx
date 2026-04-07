import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppStore";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../store/productsSlice";
import { Product, Category } from "../../types";
import apiClient from "../../lib/api";
import { normalizeProduct } from "../../utils/products";
import { toast } from "sonner";
import { CATEGORY_META } from "../../constants/categoryMeta";
import { formatUsdToNpr } from "../../utils/currency";

const emptyProduct = (): Omit<Product, "id" | "createdAt"> => ({
  name: "",
  brand: "",
  category: "phones",
  price: 0,
  originalPrice: undefined,
  images: [
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
  ],
  description: "",
  shortDescription: "",
  specs: {},
  stock: 0,
  rating: 4.5,
  reviewCount: 0,
  tags: [],
  featured: false,
  trending: false,
  isNew: true,
});

const CATEGORIES = Object.entries(CATEGORY_META).map(([value, { label }]) => ({
  value: value as Category,
  label,
}));

export default function AdminProducts() {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((s) => s.products);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct());
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImagePreview("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyProduct());
    setTagsInput("");
    setImageFile(null);
    clearPreview();
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (file) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setImagePreview(url);
    } else if (editing) {
      setImagePreview(editing.images[0] || "");
    } else {
      setImagePreview("");
    }
  };

  const previewSource = imagePreview || form.images[0];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct());
    setTagsInput("");
    setImageFile(null);
    clearPreview();
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ ...product });
    setTagsInput(product.tags.join(", "));
    setImageFile(null);
    clearPreview();
    setImagePreview(product.images[0] || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.brand || form.price <= 0) {
      toast.error("Please fill required fields");
      return;
    }
    if (saving) {
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("brand", form.brand.trim());
    payload.append("description", form.description);
    payload.append("shortdescription", form.shortDescription);
    payload.append("category", form.category);
    payload.append("price", String(form.price));
    payload.append("stock", String(form.stock));
    payload.append("rating", String(form.rating));
    payload.append("featured", form.featured ? "true" : "false");
    payload.append("trending", form.trending ? "true" : "false");
    payload.append("is_new", form.isNew ? "true" : "false");
    payload.append("tags", tagsInput.trim());

    if (form.originalPrice) {
      payload.append("discount_price", String(form.originalPrice));
    }
    if (imageFile) {
      payload.append("images", imageFile);
    }

    try {
      setSaving(true);
      const response = editing
        ? await apiClient.put(`/products/edit/${editing.id}/`, payload)
        : await apiClient.post("/products/add/", payload);
      const normalized = normalizeProduct(response.data);
      if (editing) {
        dispatch(updateProduct(normalized));
        toast.success("Product updated");
      } else {
        dispatch(addProduct(normalized));
        toast.success("Product added");
      }
      closeModal();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.response?.data ||
        error?.message ||
        "Unable to save product";
      toast.error(typeof message === "string" ? message : JSON.stringify(message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteProduct(id));
    toast.success("Product deleted");
    setDeleteConfirm(null);
  };

  const set =
    (k: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.type === "number" ? +e.target.value : e.target.value,
      }));

  const toggle = (k: "featured" | "trending" | "isNew") =>
    setForm((f) => ({ ...f, [k]: !f[k] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">
            Products
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {products.length} total products
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Rating",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-surface-border"
                      />
                      <div>
                        <p className="font-medium text-white line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-zinc-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-surface-hover text-zinc-300 border border-surface-border capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-white">
                      {formatUsdToNpr(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-zinc-600 line-through ml-1">
                        {formatUsdToNpr(product.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-sm ${product.stock <= 10 ? "text-red-400" : product.stock <= 30 ? "text-yellow-400" : "text-green-400"}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star size={12} className="fill-amber-400" />
                      {product.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-surface-border">
                <h3 className="font-display font-semibold text-white text-lg">
                  {editing ? "Edit Product" : "Add Product"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-hover"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Image upload */}
                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                    Product Image
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="input flex-1"
                    />
                    {previewSource ? (
                      <img
                        src={previewSource}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-surface-border"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-surface-border bg-surface-card text-[10px] text-zinc-500 flex items-center justify-center">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      className="input"
                      placeholder="iPhone 16 Pro"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={set("brand")}
                      className="input"
                      placeholder="Apple"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={set("category")}
                      className="input"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={set("price")}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={form.originalPrice || ""}
                      onChange={set("originalPrice")}
                      className="input"
                      min={0}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={set("stock")}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                      Rating
                    </label>
                    <input
                      type="number"
                      value={form.rating}
                      onChange={set("rating")}
                      className="input"
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={set("shortDescription")}
                    className="input"
                    placeholder="Brief tagline..."
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    className="input h-24 resize-none"
                    placeholder="Full product description..."
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 font-medium mb-1.5 block">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="input"
                    placeholder="5G, flagship, pro"
                  />
                </div>

                {/* Flags */}
                <div className="flex gap-4">
                  {(["featured", "trending", "isNew"] as const).map((flag) => (
                    <label
                      key={flag}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!form[flag]}
                        onChange={() => toggle(flag)}
                        className="accent-brand-500 w-4 h-4"
                      />
                      <span className="text-sm text-zinc-400 capitalize">
                        {flag === "isNew" ? "New" : flag}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-surface-border">
                <button
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary flex-1">
                  {editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card p-6 w-full max-w-sm animate-scale-in">
              <h3 className="font-display font-semibold text-white text-lg mb-2">
                Delete Product?
              </h3>
              <p className="text-zinc-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
