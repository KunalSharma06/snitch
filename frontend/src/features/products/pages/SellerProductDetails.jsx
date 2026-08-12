import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct";
import { useParams, useNavigate } from "react-router";
import ConfirmModal from "../../Shared/Components/ConfirmModel.jsx";

// Helper icons
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const SellerProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [localVariants, setLocalVariants] = useState([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priceAmount: "",
    discountedPriceAmount: "",
    priceCurrency: "INR",
  });
  const [saving, setSaving] = useState(false);

  // UI state for inputs to maintain focus
  const [attributeInputs, setAttributeInputs] = useState([
    { key: "", value: "" },
  ]);

  // New variant state
  const [newVariant, setNewVariant] = useState({
    images: [],
    stock: 0,
    attributes: {}, // Strictly an object
    price: { amount: "", currency: "INR" },
    discountedPriceAmount: "",
  });
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    handleGetProductById,
    handleAddProductVariant,
    handleUpdateVariantStock,
    handleUpdateProduct,
    handleUpdateVariant,
    handleDeleteProduct,
    handleDeleteVariant,
  } = useProduct();
  const [deleteVariantTarget, setDeleteVariantTarget] = useState(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);

  // Per-variant edit state
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [variantEditForms, setVariantEditForms] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [groupByKey, setGroupByKey] = useState(null); // e.g. "color"

  async function fetchProductDetails() {
    setLoading(true);
    try {
      const data = await handleGetProductById(productId);
      const prod = data?.product || data;
      setProduct(prod);
      // Initialize variants locally
      if (prod?.variants) {
        setLocalVariants(prod.variants);
      }
      // Populate edit form
      setEditForm({
        title: prod?.title || "",
        description: prod?.description || "",
        priceAmount: prod?.price?.amount || "",
        discountedPriceAmount: prod?.discountedPrice?.amount || "",
        priceCurrency: prod?.price?.currency || "INR",
      });
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
   fetchProductDetails();
 }, [productId]);

 useEffect(() => {
   if (groupByKey === null && localVariants.length > 0) {
     const allKeys = new Set();
     localVariants.forEach((v) => {
       Object.keys(v.attributes || {}).forEach((k) => allKeys.add(k));
     });
     const keys = Array.from(allKeys);
     if (keys.length > 0) {
       setGroupByKey(keys[0]);
     }
   }
 }, [localVariants, groupByKey]);

  // Handlers for modifying existing variant stock natively
  const handleStockChange = (index, newStock) => {
    const updatedVariants = [...localVariants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      stock: Number(newStock),
    };
    setLocalVariants(updatedVariants);
  };

  const handleSaveStock = async (variantId, stock) => {
    if (!variantId) return;
    try {
      await handleUpdateVariantStock(productId, variantId, Number(stock) || 0);
    } catch (error) {
      console.error("Failed to update stock in DB", error);
    }
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      const data = await handleUpdateProduct(productId, editForm);
      if (data?.product) {
        setProduct(data.product);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update product", error);
    } finally {
      setSaving(false);
    }
  };

  // Handlers for New Variant Form
  const handleAddNewVariant = async () => {
    // Validate required at least one attribute to be filled
    const hasValidAttribute = attributeInputs.some(
      (attr) => attr.key.trim() && attr.value.trim(),
    );
    if (!hasValidAttribute) {
      alert("At least one valid attribute is required.");
      return;
    }

    setIsSavingVariant(true);

    // Maps preview URL so the variant list can display the image locally
    const cleanImages = newVariant.images.map((img) => ({
      url: img.previewUrl,
      file: img.file,
    }));

    // Attributes is already an object in newVariant, just use it safely
    const cleanAttributes = { ...newVariant.attributes };

    const variantToSave = {
      images: cleanImages,
      stock: Number(newVariant.stock),
      attributes: cleanAttributes,
      price: newVariant.price.amount
        ? Number(newVariant.price.amount)
        : undefined, // price is optional
      discountedPriceAmount: newVariant.discountedPriceAmount
        ? Number(newVariant.discountedPriceAmount)
        : undefined,
    };

    setIsAddingVariant(false);

    try {
      const res = await handleAddProductVariant(productId, variantToSave);
      console.log("Variant save response:", res);

      if (res && res.product) {
        setProduct(res.product);
        if (res.product.variants) {
          setLocalVariants(res.product.variants);
        }
      } else {
        await fetchProductDetails();
      }

      setIsAddingVariant(false);
      setAttributeInputs([{ key: "", value: "" }]);
      setNewVariant({
        images: [],
        stock: 0,
        attributes: {},
        price: { amount: "", currency: "INR" },
        discountedPriceAmount: "",
      });
    } catch (err) {
      console.error("Failed to add variant:", err);
      alert("Error: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsSavingVariant(false);
    }
  };

  const confirmDeleteVariant = async () => {
    if (!deleteVariantTarget) return;
    setIsDeletingVariant(true);
    try {
      const data = await handleDeleteVariant(
        productId,
        deleteVariantTarget._id,
      );
      if (data?.product?.variants) {
        setLocalVariants(data.product.variants);
      }
      setDeleteVariantTarget(null);
    } catch (err) {
      console.error("Failed to delete variant", err);
    } finally {
      setIsDeletingVariant(false);
    }
  };

  const handleAddAttribute = () => {
    setAttributeInputs((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedInputs = [...attributeInputs];
    updatedInputs[index][field] = value;
    setAttributeInputs(updatedInputs);

    const newAttrsObj = {};
    updatedInputs.forEach((attr) => {
      const normalizedKey = attr.key.trim().toLowerCase();
      if (normalizedKey !== "") {
        newAttrsObj[normalizedKey] = attr.value.trim();
      }
    });
    setNewVariant((prev) => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleRemoveAttribute = (index) => {
    const updatedInputs = attributeInputs.filter((_, i) => i !== index);
    setAttributeInputs(updatedInputs);

    const newAttrsObj = {};
    updatedInputs.forEach((attr) => {
      const normalizedKey = attr.key.trim().toLowerCase();
      if (normalizedKey !== "") {
        newAttrsObj[normalizedKey] = attr.value.trim();
      }
    });
    setNewVariant((prev) => ({ ...prev, attributes: newAttrsObj }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const availableSlots = 7 - newVariant.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      alert(`You can only upload up to 7 images. ${filesToAdd.length} added.`);
    }

    const newImageObjects = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewVariant((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageObjects],
    }));

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = newVariant.images[index];
    if (imageToRemove?.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    const updatedImages = newVariant.images.filter((_, i) => i !== index);
    setNewVariant((prev) => ({ ...prev, images: updatedImages }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">
        Loading gallery...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center text-[#1b1c1a] font-serif">
        Product Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] font-sans pb-24">
      <main className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pt-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 text-[10px] uppercase tracking-[0.2em] font-medium font-[Inter,sans-serif] flex items-center gap-3 text-[#7A6E63] hover:text-[#C9A96E] transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </button>

        {/* Base Product Info */}
        <section className="flex flex-col md:flex-row gap-8 mb-16">
          <div className="w-full md:w-1/2">
            {/* Gallery placeholder */}
            <div className="w-full aspect-[4/5] bg-[#f5f3f0] overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#7f7668]">
                  No Image
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {product.images.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`Thumb ${i}`}
                    className="w-16 h-20 object-cover bg-[#f5f3f0] shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {isEditing ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#6e6258] mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-[#d0c5b5] py-2 text-2xl font-serif focus:outline-none focus:border-[#745a27]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#6e6258] mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full bg-transparent border border-[#d0c5b5] py-2 px-3 text-base text-[#6e6258] focus:outline-none focus:border-[#745a27] resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider text-[#6e6258] mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={editForm.priceAmount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          priceAmount: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-[#d0c5b5] py-2 text-xl focus:outline-none focus:border-[#745a27]"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs uppercase tracking-wider text-[#6e6258] mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={editForm.priceCurrency}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          priceCurrency: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-[#d0c5b5] py-2 text-xl focus:outline-none focus:border-[#745a27]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#6e6258] mb-1">
                    Discounted Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={editForm.discountedPriceAmount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        discountedPriceAmount: e.target.value,
                      })
                    }
                    placeholder="Leave empty for no discount"
                    className="w-full bg-transparent border-b border-[#d0c5b5] py-2 text-xl focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5] placeholder:text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProduct}
                    disabled={saving}
                    className="bg-[#745a27] text-white px-6 py-2 text-xs uppercase tracking-wider hover:bg-[#5a4312] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="border border-[#d0c5b5] text-[#6e6258] px-6 py-2 text-xs uppercase tracking-wider hover:border-[#745a27] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4 uppercase">
                  {product.title}
                </h2>
                <p className="text-[#6e6258] text-lg mb-6 leading-relaxed max-w-md">
                  {product.description}
                </p>
                <div className="text-2xl tracking-wide font-light mb-2 flex items-center gap-3">
                  <span>
                    {product.discountedPrice?.amount
                      ? product.discountedPrice.amount
                      : product.price?.amount}{" "}
                    {product.price?.currency}
                  </span>
                  {product.discountedPrice?.amount && (
                    <span className="text-base line-through text-[#a8a094]">
                      {product.price?.amount} {product.price?.currency}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="self-start border border-[#d0c5b5] text-[#6e6258] px-6 py-2 text-xs uppercase tracking-wider hover:border-[#745a27] hover:text-[#745a27] transition-colors cursor-pointer mt-4"
                >
                  Edit Product
                </button>
              </>
            )}
          </div>
        </section>

        {/* Variants & Inventory */}
        <section className="bg-[#f5f3f0] p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h3 className="font-serif text-3xl uppercase">
              Variants & Inventory
            </h3>
            {!isAddingVariant && (
              <button
                onClick={() => setIsAddingVariant(true)}
                className="bg-[#745a27] text-[#ffffff] px-6 py-3 uppercase tracking-wider text-sm hover:bg-[#5a4312] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusIcon /> Add New Variant
              </button>
            )}
          </div>

          {/* Add New Variant Form */}
          {isAddingVariant && (
            <div className="bg-[#ffffff] p-6 md:p-8 mb-12 shadow-[0_20px_40px_rgba(27,28,26,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-serif text-xl uppercase">Create Variant</h4>
                <button
                  onClick={() => setIsAddingVariant(false)}
                  className="text-[#7f7668] hover:text-[#1b1c1a] text-sm uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Left Col: Attributes & Basics */}
                <div className="space-y-6">
                  {/* Dynamic Attributes */}
                  <div>
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-3">
                      Attributes (e.g. Size, Color) *
                    </label>
                    <div className="space-y-3">
                      {attributeInputs.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Key (e.g., Size)"
                            value={attr.key}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "key",
                                e.target.value,
                              )
                            }
                            className="w-1/2 bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g., M)"
                            value={attr.value}
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "value",
                                e.target.value,
                              )
                            }
                            className="w-1/2 bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                          />
                          {attributeInputs.length > 1 && (
                            <button
                              onClick={() => handleRemoveAttribute(index)}
                              className="text-[#ba1a1a] p-2 hover:bg-[#ffdad6] transition-colors cursor-pointer"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleAddAttribute}
                      className="mt-3 text-[#745a27] text-sm uppercase tracking-wider flex items-center gap-1 hover:text-[#5a4312] cursor-pointer"
                    >
                      <PlusIcon /> Add Attribute
                    </button>
                  </div>

                  {/* Stock & Price */}
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">
                        Initial Stock
                      </label>
                      <input
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            stock: e.target.value,
                          })
                        }
                        className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27]"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">
                        Price Amount (Optional)
                      </label>
                      <input
                        type="number"
                        value={newVariant.price.amount}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            price: {
                              ...newVariant.price,
                              amount: e.target.value,
                            },
                          })
                        }
                        placeholder="Default if empty"
                        className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                      />
                    </div>
                  </div>

                  {/* Discounted Price */}
                  <div>
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258] mb-2">
                      Discounted Price (Optional)
                    </label>
                    <input
                      type="number"
                      value={newVariant.discountedPriceAmount}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          discountedPriceAmount: e.target.value,
                        })
                      }
                      placeholder="Leave empty for no discount"
                      className="w-full bg-transparent border-b border-[#d0c5b5] py-2 focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                    />
                  </div>
                </div>

                {/* Form Right Col: Images */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm uppercase tracking-wider text-[#6e6258]">
                      Image Upload (Max 7, Optional)
                    </label>
                    <span className="text-xs text-[#7f7668]">
                      {newVariant.images.length}/7
                    </span>
                  </div>

                  {newVariant.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {newVariant.images.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-[4/5] bg-[#f5f3f0]"
                        >
                          <img
                            src={img.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-white/80 p-1 text-[#ba1a1a] hover:bg-white transition-colors cursor-pointer"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {newVariant.images.length < 7 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-[#6e6258]
                          file:mr-4 file:py-2 file:px-4
                          file:border-0 file:bg-[#f5f3f0] file:text-[#1b1c1a]
                          hover:file:bg-[#e4e2df] file:cursor-pointer file:uppercase file:text-xs file:tracking-wider file:font-serif
                          cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleAddNewVariant}
                  disabled={isSavingVariant}
                  className="bg-gradient-to-r from-[#745a27] to-[#c9a96e] text-[#ffffff] px-8 py-3 uppercase tracking-wider text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSavingVariant ? "Processing..." : "Save Variant"}
                </button>
              </div>
            </div>
          )}

          {/* Group-by selector */}
          {(() => {
            const allKeys = new Set();
            localVariants.forEach((v) => {
              Object.keys(v.attributes || {}).forEach((k) => allKeys.add(k));
            });
            const keys = Array.from(allKeys);

            return keys.length > 1 ? (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs uppercase tracking-wider text-[#6e6258]">
                  Group by:
                </span>
                {keys.map((k) => (
                  <button
                    key={k}
                    onClick={() => setGroupByKey(k)}
                    className="px-4 py-1.5 text-xs uppercase tracking-wider cursor-pointer transition-colors"
                    style={{
                      backgroundColor:
                        groupByKey === k ? "#745a27" : "transparent",
                      color: groupByKey === k ? "#fff" : "#6e6258",
                      border: `1px solid ${groupByKey === k ? "#745a27" : "#d0c5b5"}`,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ) : null;
          })()}

          {/* Variants List */}
          {localVariants.length === 0 ? (
            <div className="py-12 text-center text-[#6e6258]">
              <p>No variants have been created yet.</p>
            </div>
          ) : (
            (() => {
              // Group variants by the selected attribute key
              const groups = {};
              localVariants.forEach((variant) => {
                const groupVal = variant.attributes?.[groupByKey] || "Other";
                if (!groups[groupVal]) groups[groupVal] = [];
                groups[groupVal].push(variant);
              });

              return Object.entries(groups).map(([groupValue, variants]) => {
                const isExpanded = expandedGroups[groupValue] ?? true;

                return (
                  <div key={groupValue} className="mb-8">
                    {/* Group header */}
                    <button
                      onClick={() =>
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [groupValue]: !isExpanded,
                        }))
                      }
                      className="w-full flex items-center justify-between py-4 px-6 mb-4 cursor-pointer transition-colors"
                      style={{ backgroundColor: "#ffffff" }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="font-serif text-xl uppercase"
                          style={{ color: "#1b1c1a" }}
                        >
                          {groupByKey}: {groupValue}
                        </span>
                        <span className="text-xs text-[#a8a094] uppercase tracking-wider">
                          {variants.length}{" "}
                          {variants.length === 1 ? "variant" : "variants"}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 transition-transform duration-300"
                        style={{
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          color: "#745a27",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Group content */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {variants.map((variant, idx) => {
                          const vid = variant._id;
                          const isEditingThisVariant = editingVariantId === vid;
                          const form = variantEditForms[vid] || {
                            priceAmount: variant.price?.amount ?? "",
                            discountedPriceAmount:
                              variant.discountedPrice?.amount ?? "",
                            priceCurrency: variant.price?.currency ?? "INR",
                            stock: variant.stock ?? 0,
                            attributes: Object.fromEntries(
                              Object.entries(variant.attributes || {}),
                            ),
                          };

                          const openEdit = () => {
                            setVariantEditForms((prev) => ({
                              ...prev,
                              [vid]: {
                                priceAmount: variant.price?.amount ?? "",
                                discountedPriceAmount:
                                  variant.discountedPrice?.amount ?? "",
                                priceCurrency: variant.price?.currency ?? "INR",
                                stock: variant.stock ?? 0,
                                attributes: Object.fromEntries(
                                  Object.entries(variant.attributes || {}),
                                ),
                              },
                            }));
                            setEditingVariantId(vid);
                          };

                          const updateForm = (key, val) =>
                            setVariantEditForms((prev) => ({
                              ...prev,
                              [vid]: { ...prev[vid], [key]: val },
                            }));

                          const updateAttr = (attrKey, attrVal) =>
                            setVariantEditForms((prev) => ({
                              ...prev,
                              [vid]: {
                                ...prev[vid],
                                attributes: {
                                  ...prev[vid].attributes,
                                  [attrKey]: attrVal,
                                },
                              },
                            }));

                          const saveVariant = async () => {
                            try {
                              const data = await handleUpdateVariant(
                                productId,
                                vid,
                                form,
                              );
                              if (data?.product?.variants) {
                                setLocalVariants(data.product.variants);
                              }
                            } catch (err) {
                              console.error("Failed to update variant", err);
                            }
                            setEditingVariantId(null);
                          };

                          return (
                            <div
                              key={idx}
                              className="bg-[#ffffff] flex flex-col pt-4 shadow-[0_20px_40px_rgba(27,28,26,0.02)]"
                            >
                              {/* Variant Thumb */}
                              <div className="px-6 flex gap-4 h-24 mb-4">
                                <div className="w-16 h-20 bg-[#f5f3f0] shrink-0">
                                  {variant.images &&
                                  variant.images.length > 0 ? (
                                    <img
                                      src={variant.images[0].url}
                                      alt="Variant"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-[#7f7668]">
                                      N/A
                                    </div>
                                  )}
                                </div>

                                {!isEditingThisVariant && (
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {Object.entries(variant.attributes || {})
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([key, val]) => (
                                          <span
                                            key={key}
                                            className="bg-[#f5f3f0] px-2 py-1 text-xs uppercase tracking-wider text-[#4d463a]"
                                          >
                                            <span className="text-[#a8a094]">
                                              {key}:
                                            </span>{" "}
                                            {val}
                                          </span>
                                        ))}
                                    </div>
                                    <div className="text-sm font-light flex items-center gap-2">
                                      {variant.discountedPrice?.amount ? (
                                        <>
                                          <span>
                                            {variant.discountedPrice.amount}{" "}
                                            {variant.discountedPrice.currency}
                                          </span>
                                          <span className="line-through text-[#a8a094] text-xs">
                                            {variant.price?.amount}{" "}
                                            {variant.price?.currency}
                                          </span>
                                        </>
                                      ) : variant.price?.amount ? (
                                        <span>
                                          {variant.price.amount}{" "}
                                          {variant.price.currency}
                                        </span>
                                      ) : (
                                        "Base Price"
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {isEditingThisVariant && (
                                <div className="px-6 pb-4 space-y-3">
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider text-[#6e6258] mb-1">
                                      Attributes
                                    </label>
                                    {Object.entries(form.attributes)
                                      .sort(([a], [b]) => a.localeCompare(b))
                                      .map(([k, v]) => (
                                        <div
                                          key={k}
                                          className="flex gap-2 mb-2 items-center"
                                        >
                                          <span className="text-xs text-[#a8a094] w-16 shrink-0 uppercase tracking-wider">
                                            {k}
                                          </span>
                                          <input
                                            type="text"
                                            value={v}
                                            onChange={(e) =>
                                              updateAttr(k, e.target.value)
                                            }
                                            className="flex-1 bg-transparent border-b border-[#d0c5b5] py-1 text-sm focus:outline-none focus:border-[#745a27]"
                                          />
                                        </div>
                                      ))}
                                  </div>
                                  <div className="flex gap-3">
                                    <div className="flex-1">
                                      <label className="block text-[9px] uppercase tracking-wider text-[#6e6258] mb-1">
                                        Price
                                      </label>
                                      <input
                                        type="number"
                                        value={form.priceAmount}
                                        onChange={(e) =>
                                          updateForm(
                                            "priceAmount",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-sm focus:outline-none focus:border-[#745a27]"
                                      />
                                    </div>
                                    <div className="w-20">
                                      <label className="block text-[9px] uppercase tracking-wider text-[#6e6258] mb-1">
                                        Currency
                                      </label>
                                      <input
                                        type="text"
                                        value={form.priceCurrency}
                                        onChange={(e) =>
                                          updateForm(
                                            "priceCurrency",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-sm focus:outline-none focus:border-[#745a27]"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider text-[#6e6258] mb-1">
                                      Discounted Price (Optional)
                                    </label>
                                    <input
                                      type="number"
                                      value={form.discountedPriceAmount}
                                      onChange={(e) =>
                                        updateForm(
                                          "discountedPriceAmount",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Leave empty for no discount"
                                      className="w-full bg-transparent border-b border-[#d0c5b5] py-1 text-sm focus:outline-none focus:border-[#745a27] placeholder:text-[#d0c5b5]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider text-[#6e6258] mb-1">
                                      Stock
                                    </label>
                                    <input
                                      type="number"
                                      value={form.stock}
                                      onChange={(e) =>
                                        updateForm("stock", e.target.value)
                                      }
                                      className="w-24 bg-transparent border-b border-[#d0c5b5] py-1 text-sm focus:outline-none focus:border-[#745a27]"
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={saveVariant}
                                      className="bg-[#745a27] text-white px-5 py-1.5 text-[9px] uppercase tracking-wider hover:bg-[#5a4312] transition-colors cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingVariantId(null)}
                                      className="border border-[#d0c5b5] text-[#6e6258] px-5 py-1.5 text-[9px] uppercase tracking-wider hover:border-[#745a27] transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="mt-auto border-t border-[#f5f3f0] bg-[#fbf9f6] flex items-center px-6 py-3 justify-between">
                                {!isEditingThisVariant ? (
                                  <>
                                    <label className="text-sm text-[#6e6258] uppercase tracking-wider">
                                      Stock: {variant.stock ?? 0}
                                    </label>
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={openEdit}
                                        className="text-[9px] uppercase tracking-[0.15em] text-[#745a27] hover:text-[#5a4312] transition-colors cursor-pointer"
                                      >
                                        Edit Variant
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeleteVariantTarget(variant)
                                        }
                                        className="text-[9px] uppercase tracking-[0.15em] text-[#ba1a1a] hover:text-[#8f1414] transition-colors cursor-pointer"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#a8a094]">
                                    Editing…
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()
          )}
        </section>
      </main>
      <ConfirmModal
        isOpen={!!deleteVariantTarget}
        title="Remove this variant?"
        message="This variant and its stock will be permanently removed. This cannot be undone."
        confirmText="Remove"
        onConfirm={confirmDeleteVariant}
        onCancel={() => setDeleteVariantTarget(null)}
        isProcessing={isDeletingVariant}
      />
    </div>
  );
};

export default SellerProductDetails;
