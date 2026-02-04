import { useState } from "react";

import t1 from "@/assets/t1.svg";
import t2 from "@/assets/t2.svg";
import t3 from "@/assets/t3.svg";
import t4 from "@/assets/t4.svg";
import t5 from "@/assets/t5.svg";

import l0 from "@/assets/l0.svg";
import l1 from "@/assets/l1.svg";
import r0 from "@/assets/r0.svg";
import r1 from "@/assets/r1.svg";

const slides = [t1, t2, t3, t4, t5];

export function ClientSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Maximum index (5 cards - 3 visible = 2 possible positions: 0, 1, 2)
  const maxIndex = slides.length - 3;
  
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < maxIndex;
  
  const handlePrev = () => {
    if (canGoLeft) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const handleNext = () => {
    if (canGoRight) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <section className="py-24 md:py-32 overflow-hidden" style={{ background: '#111111' }}>
      <div className="max-w-[1260px] mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <span 
            className="block mb-4 antialiased lowercase"
            style={{ 
              color: "#EB4B29", 
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "28px",
            }}
          >
            client
          </span>
          <h2 
            className="antialiased"
            style={{ 
              color: "#FFFFFF",
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 400,
              fontSize: "56px",
              lineHeight: "72px",
              letterSpacing: "-0.025em"
            }}
          >
            ROS와 함께한 팀
          </h2>
        </div>

        {/* Slider Container - responsive with max-width */}
        <div className="relative w-full max-w-[1260px] mx-auto">
          {/* Cards Container with overflow hidden */}
          <div className="overflow-hidden w-full">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateX(calc(-${currentIndex} * (calc((100% - 64px) / 3) + 32px)))`,
                gap: "32px"
              }}
            >
              {slides.map((slide, index) => (
                <div 
                  key={index}
                  style={{ 
                    flex: "0 0 calc((100% - 64px) / 3)",
                    boxSizing: "border-box",
                    height: "480px",
                    backgroundColor: "#1E1E1E",
                    borderRadius: "16px",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={slide}
                    alt={`클라이언트 ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "center"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Bottom Right, total height 564px (480 cards + 32 gap + 52 buttons) */}
          <div className="flex justify-end items-center gap-3" style={{ marginTop: "32px" }}>
            {/* Left Button */}
            <button
              onClick={handlePrev}
              disabled={!canGoLeft}
              className="w-[52px] h-[52px] transition-opacity"
              aria-label="이전 슬라이드"
            >
              <img 
                src={canGoLeft ? l0 : l1} 
                alt="Previous" 
                className="w-full h-full"
              />
            </button>

            {/* Right Button */}
            <button
              onClick={handleNext}
              disabled={!canGoRight}
              className="w-[52px] h-[52px] transition-opacity"
              aria-label="다음 슬라이드"
            >
              <img 
                src={canGoRight ? r0 : r1} 
                alt="Next" 
                className="w-full h-full"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
