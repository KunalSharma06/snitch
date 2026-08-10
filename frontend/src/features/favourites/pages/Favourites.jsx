import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useFavourites } from "../hook/useFavourites";
import FavouriteButton from "../components/FavouriteButton";

const tokens = {
  surface: "#fbf9f6",
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: tokens.surface }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: tokens.muted }}
        >
          Loading favourites...
        </p>
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
        className="min-h-screen pb-24"
        style={{
          backgroundColor: tokens.surface,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-12 lg:pt-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: tokens.secondary }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1
            className="font-light mb-12"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: tokens.onSurface,
            }}
          >
            Your Favourites
          </h1>

          {favourites.filter((fav) => fav.product && favouriteIds.includes(fav.product._id)).length === 0 ? (
            <div className="py-24 text-center">
              <p
                className="text-lg mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: tokens.onSurface,
                }}
              >
                No favourites yet.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer"
                style={{
                  backgroundColor: tokens.onSurface,
                  color: tokens.surface,
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {favourites
                .filter((fav) => fav.product && favouriteIds.includes(fav.product._id))
                .map((fav) => {
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

                return (
                  <div
                    key={fav._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="cursor-pointer group"
                  >
                    <div
                      className="relative overflow-hidden mb-3"
                      style={{
                        aspectRatio: "3/4",
                        backgroundColor: tokens.surfaceHighest,
                      }}
                    >
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <FavouriteButton productId={product._id} size={20} />
                      </div>
                    </div>
                    <p
                      className="text-sm mb-1 "
                      style={{ color: tokens.primary, fontWeight: 500 }}
                    >
                      {product.brand}
                    </p>
                    <p
                      className="text-sm mb-1"
                      style={{ color: tokens.onSurface }}
                    >
                      {product.title}
                    </p>
                    <p className="text-xs" style={{ color: tokens.secondary }}>
                      {price
                        ? formatCurrency(price.amount, price.currency)
                        : "—"}
                    </p>
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
