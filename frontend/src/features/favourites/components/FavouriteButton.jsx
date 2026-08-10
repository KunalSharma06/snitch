import React, { useState } from "react";
import { useFavourites } from "../hook/useFavourites";

const FavouriteButton = ({ productId, size = 20 }) => {
  const { isFavourite, handleToggleFavourite } = useFavourites();
  const [loading, setLoading] = useState(false);
  const active = isFavourite(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await handleToggleFavourite(productId);
    } catch (err) {
      console.error("Failed to toggle favourite", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      className="cursor-pointer transition-transform duration-150 hover:scale-110 disabled:opacity-50"
      style={{ color: active ? "#C9A96E" : "#1b1c1a" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
};

export default FavouriteButton;
