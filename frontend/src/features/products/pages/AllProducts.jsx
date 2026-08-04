import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useProduct } from "../hook/useProduct";
import { useNavigate } from "react-router";

const AllProducts = () => {
  const products = useSelector((state) => state.product.products);
  const { handleGetAllProducts } = useProduct();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  const productTypes = products
    ? ["ALL", ...new Set(products.map((p) => p.productType).filter(Boolean))]
    : ["ALL"];

   const searchSuggestions = (products || [])
     .filter(
       (p) =>
         p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (p.productType &&
           p.productType.toLowerCase().includes(searchQuery.toLowerCase())) ||
         (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())),
     )
     .slice(0, 5);

   const filtered = products?.filter((p) => {
     const matchesFilter = filter === "ALL" || p.productType === filter;
     const matchesSearch =
       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (p.productType &&
         p.productType.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
     return matchesFilter && matchesSearch;
   });

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen selection:bg-[#C9A96E]/30"
        style={{ backgroundColor: "#fbf9f6", fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── Header / Filter ── */}
        <div className="pt-24 pb-16 px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto flex flex-col items-center">
          <span
            className="text-[10px] uppercase tracking-[0.24em] font-medium mb-4"
            style={{ color: "#C9A96E" }}
          >
            Explore
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-12 text-center"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#1b1c1a",
            }}
          >
            The Full Archive
          </h1>

          {/* ── Search Bar ── */}
          <div className="w-full max-w-md mx-auto mb-10 relative z-50">
            <div className="relative flex items-center">
              <svg className="w-4 h-4 absolute left-4 text-[#7A6E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="Search the collection..."
                className="w-full bg-transparent border border-[#e4e2df] py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#1b1c1a] transition-colors placeholder:text-[#7A6E63]/60 font-light"
                style={{ color: "#1b1c1a" }}
              />
              {searchQuery && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery("");
                  }}
                  className="absolute right-4 text-[#7A6E63] hover:text-[#1b1c1a]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim() !== "" && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 border border-[#e4e2df] shadow-lg overflow-hidden"
                style={{ backgroundColor: "#fbf9f6" }}
              >
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((prod) => (
                    <div
                      key={prod._id}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents the input from losing focus immediately
                        setSearchQuery("");
                        setShowSuggestions(false);
                        navigate(`/product/${prod._id}`);
                      }}
                      className="px-5 py-3 hover:bg-[#f5f3f0] cursor-pointer flex items-center justify-between transition-colors border-b border-[#e4e2df]/50 last:border-0"
                    >
                      <span className="text-sm line-clamp-1" style={{ color: "#1b1c1a" }}>{prod.title}</span>
                       <span className="text-[9px] uppercase tracking-[0.1em] shrink-0 ml-4" style={{ color: "#C9A96E" }}>
                        {prod.brand && prod.brand !== "Unbranded" ? prod.brand : prod.productType}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center text-sm" style={{ color: "#7A6E63" }}>
                    No matching pieces found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Bar */}
          {productTypes.length > 1 && (
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 border-b w-full pb-4" style={{ borderColor: "#e4e2df" }}>
              {productTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-300 relative`}
                  style={{
                    color: filter === type ? "#1b1c1a" : "#7A6E63",
                    fontWeight: filter === type ? 500 : 400,
                  }}
                >
                  {type}
                  {filter === type && (
                    <span
                      className="absolute -bottom-[17px] left-0 right-0 h-[1px]"
                      style={{ backgroundColor: "#1b1c1a" }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Grid ── */}
        <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pb-32">
          {filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {filtered.map((product) => {
                const imageUrl =
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : "/snitch_editorial_warm.png";
                
                const isHovered = hoveredId === product._id;

                return (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    onMouseEnter={() => setHoveredId(product._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group cursor-pointer flex flex-col"
                  >
                    {/* Image Container */}
                    <div
                      className="aspect-[4/5] overflow-hidden mb-6 relative"
                      style={{ backgroundColor: "#f5f3f0" }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Subtle Overlay on Hover */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
                        style={{ backgroundColor: "rgba(27,28,26,0.03)" }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col items-center text-center px-4">
                      {product.brand && product.brand !== "Unbranded" && (
                        <span
                          className="text-[9px] uppercase tracking-[0.2em] font-medium mb-1"
                          style={{ color: "#C9A96E" }}
                        >
                          {product.brand}
                        </span>
                      )}
                      <h3
                        className="text-lg leading-snug transition-colors duration-300 group-hover:text-[#C9A96E] line-clamp-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "#1b1c1a",
                        }}
                      >
                        {product.title}
                      </h3>

                      <div className="mt-3">
                        <span
                          className="text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: "#7A6E63" }}
                        >
                          {product.price?.currency}{" "}
                          {product.price?.amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="py-24 text-center flex flex-col items-center">
              <h2
                className="text-2xl mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#1b1c1a",
                }}
              >
                No pieces found.
              </h2>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AllProducts;
