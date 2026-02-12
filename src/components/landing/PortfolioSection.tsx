import { useNavigate } from "react-router-dom";

// Portfolio images from src/assets
import bd from "@/assets/bd.png";
import bd1 from "@/assets/bd1.png";
import bd2 from "@/assets/bd2.png";
import bd3 from "@/assets/bd3.png";
import bd4 from "@/assets/bd4.png";

const portfolioImages = [bd, bd1, bd2, bd3, bd4];

export function PortfolioSection() {
  const navigate = useNavigate();

  // Duplicate images for seamless loop
  const duplicatedImages = [...portfolioImages, ...portfolioImages];

  return (
    <section style={{ background: '#111111' }} className="py-[120px] overflow-hidden">
      {/* Header */}
      <div className="text-center mb-16">
        <span
          className="block mb-4"
          style={{
            color: "#EB4B29",
            
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: "28px",
          }}
        >
          portfolio
        </span>
        <h2
          className="text-white antialiased"
            style={{
              
              fontWeight: 600,
              fontSize: "56px",
              lineHeight: "72px",
              letterSpacing: "-0.025em",
            }}
        >
          브랜드에 맞는 디자인
        </h2>
      </div>

      {/* Infinite Marquee Slider */}
      <div className="relative w-full mb-16">
        <div className="flex animate-portfolio-marquee">
          {duplicatedImages.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ marginRight: "24px" }}
            >
              <div
                className="w-[360px] h-[360px] overflow-hidden"
                style={{ borderRadius: "24px" }}
              >
                <img
                  src={image}
                  alt={`Portfolio ${(index % 5) + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI MATCHING+ Button */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/ai-matching")}
          className="relative overflow-hidden transition-all duration-300 hover:scale-105"
          style={{
            width: "171px",
            height: "56px",
            borderRadius: "225px",
            background:
              "radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow:
              "inset 0px 0px 38.8px 0px rgba(255, 255, 255, 0.1), 0px 80px 100px -19px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Gradient border overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%)",
              padding: "1px",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <span
            className="relative z-10"
            style={{
              color: "#FFFFFF",
              
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            AI MATCHING +
          </span>
        </button>
      </div>
    </section>
  );
}
