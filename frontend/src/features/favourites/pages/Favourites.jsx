import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useFavourites } from "../hook/useFavourites";
import FavouriteButton from "../components/FavouriteButton";

const tokens = {
  surface: "#fbf9f6",
  surfaceLow: "#f5f3f0",
  surfaceLowest: "#ffffff",
  surfaceHighest: "#e4e2df",
  onSurface: "#1b1c1a",
  secondary: "#7A6E63",
  muted: "#B5ADA3",
  primary: "#C9A96E",
};

const Favourites = () => {
  const navigate = useNavigate();
  const { handleGetFavourites, favouriteIds } = useFavourites();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    async function fetchFavourites() {
      try {
        const data = await handleGetFavourites();
        setFavourites(data);
      } catch (err) {
        console.error("Failed to fetch favourites", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFavourites();
  }, []);

  const formatCurrency = (amount, currency = "INR") =>
    `${currency} ${Number(amount || 0).toLocaleString("en-IN")}`;

  const visibleFavourites = favourites.filter(
    (fav) => fav.product && favouriteIds.includes(fav.product._id),
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: tokens.surface }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: tokens.surfaceHighest,
              borderTopColor: tokens.primary,
            }}
          />
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: tokens.muted }}
          >
            Loading your favourites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen selection:bg-[#C9A96E]/30"
        style={{
          backgroundColor: tokens.surface,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-24 pt-8 sm:pt-12 lg:pt-16 pb-24">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 sm:mb-8 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: tokens.secondary }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.24em] font-medium mb-3 block"
                style={{ color: tokens.primary }}
              >
                Saved Pieces
              </span>
              <h1
                className="font-light leading-[1.05]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: tokens.onSurface,
                }}
              >
                Your Favourites
              </h1>
            </div>
            {visibleFavourites.length > 0 && (
              <p
                className="hidden sm:block text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ color: tokens.muted }}
              >
                {visibleFavourites.length}{" "}
                {visibleFavourites.length === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>

          {visibleFavourites.length === 0 ? (
            <div className="py-20 sm:py-32 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: tokens.surfaceLow }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={tokens.muted}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                </svg>
              </div>
              <h2
                className="font-light mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.75rem",
                  color: tokens.onSurface,
                }}
              >
                Nothing saved yet.
              </h2>
              <p
                className="text-sm max-w-xs mb-8"
                style={{ color: tokens.secondary }}
              >
                Tap the heart on any piece to save it here for later.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: tokens.onSurface,
                  color: tokens.surface,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.primary;
                  e.currentTarget.style.color = tokens.onSurface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.onSurface;
                  e.currentTarget.style.color = tokens.surface;
                }}
              >
                Explore The Archive
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-16">
              {visibleFavourites.map((fav) => {
                const product = fav.product;
                const firstVariant = product.variants?.[0];
                const image =
                  firstVariant?.images?.[0]?.url ||
                  product.images?.[0]?.url ||
                  "/snitch_editorial_warm.png";
                const price =
                  firstVariant?.discountedPrice ||
                  firstVariant?.price ||
                  product.discountedPrice ||
                  product.price;
                const originalPrice =
                  firstVariant?.discountedPrice?.amount ||
                  product.discountedPrice?.amount
                    ? firstVariant?.price || product.price
                    : null;
                const isHovered = hoveredId === fav._id;

                return (
                  <div
                    key={fav._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    onMouseEnter={() => setHoveredId(fav._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div
                      className="aspect-[4/5] overflow-hidden mb-3 sm:mb-6 relative"
                      style={{ backgroundColor: tokens.surfaceLow }}
                    >
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
                        style={{ backgroundColor: "rgba(27,28,26,0.03)" }}
                      />
                      <div
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FavouriteButton productId={product._id} size={18} />
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center px-1 sm:px-4">
                      {product.brand && product.brand !== "Unbranded" && (
                        <span
                          className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium mb-1"
                          style={{ color: tokens.primary }}
                        >
                          {product.brand}
                        </span>
                      )}
                      <h3
                        className="text-sm sm:text-lg leading-snug transition-colors duration-300 group-hover:text-[#C9A96E] line-clamp-1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: tokens.onSurface,
                        }}
                      >
                        {product.title}
                      </h3>

                      <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2 flex-wrap">
                        <span
                          className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: tokens.onSurface }}
                        >
                          {formatCurrency(price?.amount, price?.currency)}
                        </span>
                        {originalPrice && (
                          <span
                            className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] line-through"
                            style={{ color: tokens.muted }}
                          >
                            {formatCurrency(
                              originalPrice.amount,
                              originalPrice.currency,
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Favourites;
