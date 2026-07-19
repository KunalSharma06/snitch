import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useProduct } from "../hook/useProduct";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const MAX_IMAGES = 7;

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addFiles = (files) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining);
    const newImages = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [images],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("priceAmount", formData.priceAmount);
      data.append("priceCurrency", formData.priceCurrency);
      images.forEach((img) => data.append("images", img.file));
      await handleCreateProduct(data);
      navigate("/");
    } catch (err) {
      console.error("Failed to create product", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] font-sans selection:bg-[#C9A96E]/30 selection:text-[#1b1c1a]">
      {/* Page shell — constrained width, centred */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="pt-10 pb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-light tracking-tight text-[#1b1c1a]">
              New Listing
            </h1>
            <div className="mt-2 w-14 h-px bg-[#C9A96E]" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pt-10 pb-20">
          {/* ── Two-column grid on desktop ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 lg:items-start">
            {/* ── LEFT COLUMN — text fields ── */}
            <div className="flex flex-col gap-10">
              {/* Product Title */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="title"
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] font-[Inter,sans-serif]"
                >
                  Product Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Oversized Linen Shirt"
                  className="bg-transparent text-[#1b1c1a] border-b border-[#d0c5b5] focus:border-[#C9A96E] outline-none px-3 py-3 text-base transition-colors duration-300 placeholder:text-[#d0c5b5] font-[Inter,sans-serif]"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] font-[Inter,sans-serif]"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the product — material, fit, details..."
                  className="bg-transparent text-[#1b1c1a] border-b border-[#d0c5b5] focus:border-[#C9A96E] outline-none px-3 py-3 text-base transition-colors duration-300 placeholder:text-[#d0c5b5] resize-none leading-relaxed font-[Inter,sans-serif]"
                />
              </div>

              {/* Price — Amount + Currency */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] font-[Inter,sans-serif]">
                  Price
                </label>
                <div className="flex gap-4 items-end">
                  {/* Amount */}
                  <div className="flex flex-col gap-1 flex-[2]">
                    <span className="text-[9px] uppercase tracking-widest text-[#7A6E63] font-[Inter,sans-serif]">
                      Amount
                    </span>
                    <input
                      id="priceAmount"
                      type="number"
                      name="priceAmount"
                      value={formData.priceAmount}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-transparent text-[#1b1c1a] border-b border-[#d0c5b5] focus:border-[#C9A96E] outline-none px-3 py-3 text-base transition-colors duration-300 placeholder:text-[#d0c5b5] font-[Inter,sans-serif] w-full"
                    />
                  </div>
                  {/* Currency */}
                  <div className="flex flex-col gap-1 flex-[1]">
                    <span className="text-[9px] uppercase tracking-widest text-[#7A6E63] font-[Inter,sans-serif]">
                      Currency
                    </span>
                    <select
                      id="priceCurrency"
                      name="priceCurrency"
                      value={formData.priceCurrency}
                      onChange={handleChange}
                      className="bg-transparent text-[#1b1c1a] border-b border-[#d0c5b5] focus:border-[#C9A96E] outline-none px-3 py-3 text-base transition-colors duration-300 font-[Inter,sans-serif] w-full cursor-pointer appearance-none"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* end LEFT COLUMN */}

            {/* ── RIGHT COLUMN — images ── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#7A6E63] font-[Inter,sans-serif]">
                  Images
                </label>
                <span className="text-[10px] text-[#7A6E63] font-[Inter,sans-serif]">
                  {images.length}/{MAX_IMAGES}
                </span>
              </div>

              {/* Drop Zone */}
              {images.length < MAX_IMAGES && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                                    border-2 border-dashed rounded-sm px-6 py-12 lg:py-16 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300
                                    ${
                                      isDragging
                                        ? "border-[#C9A96E] bg-[#C9A96E]/5"
                                        : "border-[#d0c5b5] hover:border-[#745a27] hover:bg-[#f5f3f0]"
                                    }
                                `}
                >
                  <span className="text-3xl text-[#7A6E63]">↑</span>
                  <p className="text-sm text-[#7A6E63] text-center leading-relaxed font-[Inter,sans-serif]">
                    Drop images here or{" "}
                    <span className="text-[#C9A96E] underline underline-offset-2">
                      tap to upload
                    </span>
                  </p>
                  <p className="text-[10px] text-[#b5ada3] uppercase tracking-wider font-[Inter,sans-serif]">
                    Up to {MAX_IMAGES} images
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Image Previews — 2-col grid on desktop, horizontal scroll on mobile */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-1">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-sm overflow-hidden bg-[#f5f3f0] group"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Remove overlay */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 flex items-center justify-center bg-[#131313]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-bold"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* end RIGHT COLUMN */}
          </div>
          {/* end two-column grid */}

          {/* Submit — full-width below both columns */}
          <div className="mt-10 lg:mt-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1b1c1a] text-[#fbf9f6] font-bold tracking-[0.25em] py-4 px-8 rounded-sm hover:bg-[#C9A96E] hover:text-[#1b1c1a] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-[Inter,sans-serif] text-xs uppercase"
            >
              {isSubmitting ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
      {/* end max-w-6xl container */}
    </div>
  );
};

export default CreateProduct;
