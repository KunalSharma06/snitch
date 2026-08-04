import React from "react";
import { useNavigate } from "react-router";

const BRANDS = [
  { name: "Pepe Jeans", image: "/brands/pepe-jeans.jpg" },
  { name: "Levi's", image: "/brands/levis.jpg" },
  { name: "US Polo", image: "/brands/us-polo.jpg" },
  { name: "Zara", image: "/brands/zara.jpg" },
  { name: "Snitch", image: "/brands/snitch.jpg" },
  { name: "H&M", image: "/brands/hm.jpg" },
];

const BrandSlider = () => {
  const navigate = useNavigate();
  const loopedBrands = [...BRANDS, ...BRANDS];

  return (
    <div className="py-20 border-t" style={{ borderColor: "#e4e2df", backgroundColor: "#fbf9f6" }}>
      <div className="max-w-10xl mx-auto px-8 lg:px-16 xl:px-24 mb-12">
        <p className="text-[10px] uppercase tracking-[0.24em] font-medium mb-3" style={{ color: "#C9A96E" }}>
          Curated Labels
        </p>
        <h2
          className="text-3xl md:text-4xl font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1b1c1a" }}
        >
          Shop by Brand
        </h2>
      </div>

      <div className="relative overflow-hidden">
        {/* Edge fades matching cream background */}
        <div
          className="absolute inset-y-0 left-0 w-16 md:w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #fbf9f6 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-16 md:w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #fbf9f6 0%, transparent 100%)" }}
        />

        <div className="flex brand-marquee-track" style={{ width: "max-content" }}>
          {loopedBrands.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)}
              className="group cursor-pointer flex-shrink-0 flex flex-col items-center justify-center"
              style={{ width: "260px" }}
            >
              <div
                className="w-44 h-28 flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e4e2df",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C9A96E")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e4e2df")}
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="max-w-[70%] max-h-[60%] object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/snitch_editorial_warm.png";
                  }}
                />
              </div>
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-medium mt-4 transition-colors duration-300 group-hover:text-[#C9A96E]"
                style={{ color: "#7A6E63" }}
              >
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSlider;
