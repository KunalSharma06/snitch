import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useProduct } from "../hook/useProduct";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import HeroSlider from "../components/HeroSlider";
import BrandSlider from "../components/BrandSlider";

const Home = () => {
  const [products, setProducts] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const { handleGetFeaturedProducts } = useProduct();

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "seller") {
      navigate("/seller/dashboard", { replace: true });
      return;
    }
    async function fetchFeatured() {
      try {
        const data = await handleGetFeaturedProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
    }
    fetchFeatured();
  }, [user, navigate]);

  return (
    <>
      {/* Google Fonts */}
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
        <HeroSlider products={products} />

        <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
          {/* ── Hero / Header ── */}
          <div className="pt-20 pb-20 text-center flex flex-col items-center">
            <span
              className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6"
              style={{ color: "#C9A96E" }}
            >
              The Collection
            </span>
            <h1
              className="text-5xl lg:text-7xl font-light leading-tight mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#1b1c1a",
              }}
            >
              Curated Archive
            </h1>
            <p
              className="max-w-xl mx-auto text-sm leading-relaxed"
              style={{ color: "#7A6E63" }}
            >
              Discover our latest curation of premium minimalist pieces,
              meticulously designed for effortless elegance and enduring
              quality.
            </p>
          </div>

          {/* ── Product Grid ── */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 pb-32">
              {products.map((product) => {
                const imageUrl =
                  product.images && product.images.length > 0
                    ? product.images[0].url
                    : "/snitch_editorial_warm.png"; // Fallback

                return (
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    key={product._id}
                    className="group cursor-pointer flex flex-col"
                  >
                    {/* Image Container */}
                    <div
                      className="aspect-[4/5] overflow-hidden mb-6"
                      style={{ backgroundColor: "#f5f3f0" }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-2">
                      {product.brand && product.brand !== "Unbranded" && (
                        <span
                          className="text-[9px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: "#C9A96E" }}
                        >
                          {product.brand}
                        </span>
                      )}
                      <h3
                        className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: "#1b1c1a",
                        }}
                      >
                        {product.title}
                      </h3>

                      <div className="mt-2">
                        <span
                          className="text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: "#1b1c1a" }}
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
                No pieces available.
              </h2>
              <p
                className="max-w-md mx-auto text-sm leading-relaxed"
                style={{ color: "#7A6E63" }}
              >
                We are currently preparing our next collection. Please check
                back later.
              </p>
            </div>
          )}

          <BrandSlider />

          {/* ── Explore More CTA ── */}
          <div className="pb-32 flex flex-col items-center text-center">
            <div
              className="w-16 h-px mb-8"
              style={{ backgroundColor: "#C9A96E" }}
            />
            <p
              className="text-[10px] uppercase tracking-[0.24em] font-medium mb-4"
              style={{ color: "#C9A96E" }}
            >
              Beyond The Edit
            </p>
            <h2
              className="text-3xl md:text-4xl font-light leading-tight mb-6 max-w-md"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "#1b1c1a",
              }}
            >
              There's more to discover
            </h2>
            <p
              className="text-sm leading-relaxed max-w-sm mb-10"
              style={{ color: "#7A6E63" }}
            >
              This is only a glimpse. Step into the full archive for our
              complete collection of curated pieces.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="group relative px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-medium overflow-hidden transition-all duration-500"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #1b1c1a",
                color: "#1b1c1a",
              }}
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-[#fbf9f6]">
                Explore The Full Archive
              </span>
              <span
                className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                style={{ backgroundColor: "#1b1c1a" }}
              />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer
          className="border-t py-12 text-center"
          style={{ borderColor: "#e4e2df" }}
        >
          <span
            className="text-[15px] uppercase tracking-[0.35em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#C9A96E",
            }}
          >
            Snitch. © {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </>
  );
};



//  <footer className="border-t" style={{ borderColor: "#e4e2df" }}>
//    <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 py-16">
//      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
//        {/* Brand column */}
//        <div className="col-span-2 md:col-span-1">
//          <span
//            className="text-lg tracking-[0.3em] uppercase block mb-4"
//            style={{
//              fontFamily: "'Cormorant Garamond', serif",
//              color: "#C9A96E",
//            }}
//          >
//            Snitch.
//          </span>
//          <p
//            className="text-[12px] leading-relaxed max-w-[220px]"
//            style={{ color: "#7A6E63" }}
//          >
//            Curated menswear for the modern minimalist. Crafted with intention,
//            worn with confidence.
//          </p>
//        </div>

//        {/* Shop column */}
//        <div>
//          <p
//            className="text-[10px] uppercase tracking-[0.2em] font-medium mb-5"
//            style={{ color: "#1b1c1a" }}
//          >
//            Shop
//          </p>
//          <ul className="flex flex-col gap-3">
//            {[
//              { label: "Full Archive", href: "/products" },
//              { label: "New Arrivals", href: "/products" },
//              { label: "Best Sellers", href: "/products" },
//            ].map((item) => (
//              <li key={item.label}>
//                <a
//                  href={item.href}
//                  className="text-[12px] transition-colors duration-200"
//                  style={{ color: "#7A6E63" }}
//                  onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
//                  onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
//                >
//                  {item.label}
//                </a>
//              </li>
//            ))}
//          </ul>
//        </div>

//        {/* Company column */}
//        <div>
//          <p
//            className="text-[10px] uppercase tracking-[0.2em] font-medium mb-5"
//            style={{ color: "#1b1c1a" }}
//          >
//            Company
//          </p>
//          <ul className="flex flex-col gap-3">
//            {[
//              { label: "About Us", href: "#" },
//              { label: "Careers", href: "#" },
//              { label: "Sell on Snitch", href: "/seller/dashboard" },
//            ].map((item) => (
//              <li key={item.label}>
//                <a
//                  href={item.href}
//                  className="text-[12px] transition-colors duration-200"
//                  style={{ color: "#7A6E63" }}
//                  onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
//                  onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
//                >
//                  {item.label}
//                </a>
//              </li>
//            ))}
//          </ul>
//        </div>

//        {/* Support column */}
//        <div>
//          <p
//            className="text-[10px] uppercase tracking-[0.2em] font-medium mb-5"
//            style={{ color: "#1b1c1a" }}
//          >
//            Support
//          </p>
//          <ul className="flex flex-col gap-3">
//            {[
//              { label: "Contact Us", href: "#" },
//              { label: "Shipping & Returns", href: "#" },
//              { label: "FAQs", href: "#" },
//            ].map((item) => (
//              <li key={item.label}>
//                <a
//                  href={item.href}
//                  className="text-[12px] transition-colors duration-200"
//                  style={{ color: "#7A6E63" }}
//                  onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
//                  onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
//                >
//                  {item.label}
//                </a>
//              </li>
//            ))}
//          </ul>
//        </div>
//      </div>

//      {/* Bottom bar */}
//      <div
//        className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
//        style={{ borderColor: "#e4e2df" }}
//      >
//        <span
//          className="text-[10px] uppercase tracking-[0.2em]"
//          style={{ color: "#B5ADA3" }}
//        >
//          Snitch. © {new Date().getFullYear()} — All rights reserved.
//        </span>

//        <div className="flex items-center gap-5">
//          {["Instagram", "Pinterest", "TikTok"].map((social) => (
//            <a
//              key={social}
//              href="#"
//              className="text-[10px] uppercase tracking-[0.2em] transition-colors duration-200"
//              style={{ color: "#7A6E63" }}
//              onMouseEnter={(e) => (e.target.style.color = "#C9A96E")}
//              onMouseLeave={(e) => (e.target.style.color = "#7A6E63")}
//            >
//              {social}
//            </a>
//          ))}
//        </div>
//      </div>
//    </div>
//  </footer>;

export default Home;
