import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useProduct } from "../hook/useProduct";
import { useNavigate, useSearchParams } from "react-router";
import FavouriteButton from "../../favourites/components/FavouriteButton";

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 - ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];

const AllProducts = () => {
  const products = useSelector((state) => state.product.products);
  const { handleGetAllProducts, handleGetFilterOptions, handleSearchProducts } =
    useProduct();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const STORAGE_KEY = "snitch_product_filters";

  const loadSavedFilters = () => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const saved = loadSavedFilters();

  const [filter, setFilter] = useState(saved?.filter || "ALL");
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(
    saved?.appliedSearch || "",
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Filter panel state ──
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState(
    saved?.appliedFilters?.brands || [],
  );
  const [selectedCategories, setSelectedCategories] = useState(
    saved?.appliedFilters?.categories || [],
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    saved?.appliedFilters?.priceRange || null,
  );

  const [appliedFilters, setAppliedFilters] = useState(
    saved?.appliedFilters || { brands: [], categories: [], priceRange: null },
  );

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const data = await handleGetFilterOptions();
        setAvailableCategories(data.categories || []);
        setAvailableBrands(data.brands || []);
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    }
    fetchFilterOptions();
  }, []);

  // Pre-fill brand filter if navigated here via ?brand=X
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      setSelectedBrands([brandParam]);
      setAppliedFilters((prev) => ({ ...prev, brands: [brandParam] }));

      // Remove it from the URL so it doesn't lock the filter state
      searchParams.delete("brand");
      navigate("/products", { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const toSave = {
      filter,
      appliedSearch,
      appliedFilters,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [filter, appliedSearch, appliedFilters]);

  const productTypes = availableCategories;
  const brands = availableBrands;

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = React.useRef(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await handleSearchProducts(searchQuery.trim());
        setSearchSuggestions(results.slice(0, 5));
      } catch (err) {
        console.error("Search failed", err);
        setSearchSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  const [appliedSearchResults, setAppliedSearchResults] = useState(null);

  useEffect(() => {
    if (!appliedSearch.trim()) {
      setAppliedSearchResults(null);
      return;
    }
    async function runSearch() {
      try {
        const results = await handleSearchProducts(appliedSearch.trim());
        setAppliedSearchResults(results);
      } catch (err) {
        console.error("Search failed", err);
        setAppliedSearchResults([]);
      }
    }
    runSearch();
  }, [appliedSearch]);

  const baseList =
    appliedSearch.trim() !== "" ? appliedSearchResults || [] : products;

  const filtered = baseList?.filter((p) => {
    const matchesFilter = filter === "ALL" || p.productType === filter;

    const matchesBrand =
      appliedFilters.brands.length === 0 ||
      appliedFilters.brands.includes(p.brand);

    const matchesCategory =
      appliedFilters.categories.length === 0 ||
      appliedFilters.categories.includes(p.productType);

    const matchesPrice =
      !appliedFilters.priceRange ||
      (p.price?.amount >= appliedFilters.priceRange.min &&
        p.price?.amount < appliedFilters.priceRange.max);

    return matchesFilter && matchesBrand && matchesCategory && matchesPrice;
  });

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    setIsApplyingFilters(true);

    setTimeout(() => {
      setAppliedFilters({
        brands: selectedBrands,
        categories: selectedCategories,
        priceRange: selectedPriceRange,
      });
      setIsApplyingFilters(false);
    }, 900);
  };

  const handleResetFilters = () => {
    setIsFilterOpen(false);
    setIsApplyingFilters(true);

    setTimeout(() => {
      setSelectedBrands([]);
      setSelectedCategories([]);
      setSelectedPriceRange(null);
      setAppliedFilters({ brands: [], categories: [], priceRange: null });
      setFilter("ALL");
      setAppliedSearch("");
      sessionStorage.removeItem(STORAGE_KEY);
      setIsApplyingFilters(false);
    }, 900);
  };

  const activeFilterCount =
    appliedFilters.brands.length +
    appliedFilters.categories.length +
    (appliedFilters.priceRange ? 1 : 0);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen selection:bg-[#C9A96E]/30"
        style={{
          backgroundColor: "#fbf9f6",
          fontFamily: "'Inter', sans-serif",
        }}
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
          <div className="w-full max-w-md mx-auto mb-8 relative z-50">
            <div className="relative flex items-center">
              <svg
                className="w-4 h-4 absolute left-4 text-[#7A6E63]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setAppliedSearch(searchQuery.trim());
                    setShowSuggestions(false);
                    setSearchQuery("");
                    e.target.blur();
                  }
                }}
                placeholder="Search the collection..."
                className="w-full bg-transparent border py-3.5 pl-12 pr-4 text-sm focus:outline-none transition-all duration-200 placeholder:text-[#7A6E63]/60 font-light"
                style={{
                  color: "#1b1c1a",
                  borderColor:
                    showSuggestions && searchQuery ? "#C9A96E" : "#e4e2df",
                  boxShadow:
                    showSuggestions && searchQuery
                      ? "0 4px 16px rgba(201,169,110,0.15)"
                      : "none",
                }}
              />
              {searchQuery && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery("");
                    setAppliedSearch("");
                  }}
                  className="absolute right-4 text-[#7A6E63] hover:text-[#1b1c1a]"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {showSuggestions && searchQuery.trim() !== "" && (
              <div
                className="absolute top-full left-0 right-0 mt-2 border overflow-hidden animate-fade-in-down"
                style={{
                  backgroundColor: "#fbf9f6",
                  borderColor: "#e4e2df",
                  boxShadow: "0 12px 32px rgba(27,28,26,0.1)",
                }}
              >
                {searchLoading ? (
                  <div className="px-5 py-6 flex items-center justify-center gap-2">
                    <div
                      className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "#e4e2df",
                        borderTopColor: "#C9A96E",
                      }}
                    />
                    <span
                      className="text-[11px] uppercase tracking-wider"
                      style={{ color: "#B5ADA3" }}
                    >
                      Searching...
                    </span>
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  searchSuggestions.map((prod) => {
                    const thumb =
                      prod.images?.[0]?.url || "/snitch_editorial_warm.png";
                    return (
                      <div
                        key={prod._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchQuery("");
                          setAppliedSearch("");
                          setShowSuggestions(false);
                          navigate(`/product/${prod._id}`);
                        }}
                        className="px-5 py-3 hover:bg-[#f5f3f0] cursor-pointer flex items-center gap-3 transition-colors border-b border-[#e4e2df]/50 last:border-0"
                      >
                        <div
                          className="w-9 h-11 flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: "#e4e2df" }}
                        >
                          <img
                            src={thumb}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                          <span
                            className="text-sm line-clamp-1"
                            style={{ color: "#1b1c1a" }}
                          >
                            {prod.title}
                          </span>
                          <span
                            className="text-[9px] uppercase tracking-[0.1em] shrink-0"
                            style={{ color: "#C9A96E" }}
                          >
                            {prod.brand && prod.brand !== "Unbranded"
                              ? prod.brand
                              : prod.productType}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="px-5 py-6 text-center text-sm"
                    style={{ color: "#7A6E63" }}
                  >
                    No matching pieces found.
                  </div>
                )}
              </div>
            )}
          </div>

          {appliedSearch && (
            <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-center gap-2">
              <span className="text-[12px]" style={{ color: "#7A6E63" }}>
                Showing results for{" "}
                <strong style={{ color: "#1b1c1a" }}>"{appliedSearch}"</strong>
              </span>
              <button
                onClick={() => setAppliedSearch("")}
                className="text-[11px] uppercase tracking-[0.15em] underline cursor-pointer"
                style={{ color: "#C9A96E" }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Category quick-filter bar + Filter trigger (right-aligned) */}
          <div
            className="w-full flex items-center justify-between gap-6 flex-wrap border-b pb-4"
            style={{ borderColor: "#e4e2df" }}
          ></div>

          {/* Category quick-filter bar + Filter trigger (right-aligned) */}
          <div
            className="w-full flex items-center justify-between gap-6 flex-wrap border-b pb-4"
            style={{ borderColor: "#e4e2df" }}
          >
            {productTypes.length > 0 ? (
              <div className="flex flex-wrap gap-8 md:gap-12">
                {["ALL", ...productTypes].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className="text-[11px] uppercase tracking-[0.2em] transition-all duration-300 relative pb-1 cursor-pointer"
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
            ) : (
              <div />
            )}

            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border transition-all duration-300 shrink-0 cursor-pointer"
              style={{
                borderColor: activeFilterCount > 0 ? "#C9A96E" : "#d0c5b5",
                color: "#1b1c1a",
                backgroundColor:
                  activeFilterCount > 0 ? "#faf5ec" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#C9A96E")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor =
                  activeFilterCount > 0 ? "#C9A96E" : "#d0c5b5")
              }
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 4h18M6 9h12M10 14h4"
                />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: "#C9A96E", color: "#1b1c1a" }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {(() => {
            return null;
          })()}

          {/* Category quick-filter bar */}
        </div>

        {/* ── Product Grid ── */}
        <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pb-32 relative">
          {isApplyingFilters ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "#e4e2df",
                  borderTopColor: "#C9A96E",
                }}
              />
              <p
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "#B5ADA3" }}
              >
                Curating your selection...
              </p>
            </div>
          ) : filtered && filtered.length > 0 ? (
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
                    <div
                      className="aspect-[4/5] overflow-hidden mb-6 relative"
                      style={{ backgroundColor: "#f5f3f0" }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
                        style={{ backgroundColor: "rgba(27,28,26,0.03)" }}
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <FavouriteButton productId={product._id} size={20} />
                      </div>
                    </div>

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

                      <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                        {product.discountedPrice?.amount ? (
                          <>
                            <span
                              className="text-[10px] uppercase tracking-[0.2em] font-medium"
                              style={{ color: "#1b1c1a" }}
                            >
                              {product.discountedPrice.currency}{" "}
                              {product.discountedPrice.amount.toLocaleString()}
                            </span>
                            <span
                              className="text-[9px] uppercase tracking-[0.15em] line-through"
                              style={{ color: "#B5ADA3" }}
                            >
                              {product.price?.currency}{" "}
                              {product.price?.amount?.toLocaleString()}
                            </span>
                            <span
                              className="text-[9px] uppercase tracking-[0.2em] font-medium ml-1"
                              style={{ color: "#ba1a1a" }}
                            >
                              Save{" "}
                              {Math.round(
                                ((product.price.amount -
                                  product.discountedPrice.amount) /
                                  product.price.amount) *
                                  100,
                              )}
                              %
                            </span>
                          </>
                        ) : (
                          <span
                            className="text-[10px] uppercase tracking-[0.2em] font-medium"
                            style={{ color: "#7A6E63" }}
                          >
                            {product.price?.currency}{" "}
                            {product.price?.amount?.toLocaleString()}
                          </span>
                        )}
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
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-[11px] uppercase tracking-[0.2em] underline"
                  style={{ color: "#C9A96E" }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Side Panel ── */}
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(27,28,26,0.4)" }}
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col"
            style={{
              backgroundColor: "#fbf9f6",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-6 border-b"
              style={{ borderColor: "#e4e2df" }}
            >
              <h3
                className="text-2xl font-light"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#1b1c1a",
                }}
              >
                Filters
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-[#7A6E63] hover:text-[#1b1c1a] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable filter body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Brand */}
              {brands.length > 0 && (
                <div className="mb-10">
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
                    style={{ color: "#7A6E63" }}
                  >
                    Brand
                  </p>
                  <div className="flex flex-col gap-3">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 accent-[#C9A96E]"
                        />
                        <span className="text-sm" style={{ color: "#1b1c1a" }}>
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              {productTypes.length > 0 && (
                <div className="mb-10">
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
                    style={{ color: "#7A6E63" }}
                  >
                    Category
                  </p>
                  <div className="flex flex-col gap-3">
                    {productTypes.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 accent-[#C9A96E]"
                        />
                        <span className="text-sm" style={{ color: "#1b1c1a" }}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
                  style={{ color: "#7A6E63" }}
                >
                  Price Range
                </p>
                <div className="flex flex-col gap-3">
                  {PRICE_RANGES.map((range) => (
                    <label
                      key={range.label}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange?.label === range.label}
                        onChange={() => setSelectedPriceRange(range)}
                        className="w-4 h-4 accent-[#C9A96E]"
                      />
                      <span className="text-sm" style={{ color: "#1b1c1a" }}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div
              className="px-8 py-6 border-t flex gap-3"
              style={{ borderColor: "#e4e2df" }}
            >
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium border transition-all duration-300"
                style={{ borderColor: "#d0c5b5", color: "#1b1c1a" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#C9A96E")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#d0c5b5")
                }
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300"
                style={{ backgroundColor: "#1b1c1a", color: "#fbf9f6" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C9A96E";
                  e.currentTarget.style.color = "#1b1c1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1b1c1a";
                  e.currentTarget.style.color = "#fbf9f6";
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default AllProducts;
