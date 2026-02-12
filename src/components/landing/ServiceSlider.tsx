import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import cp from "@/assets/cp.svg";
import cp1 from "@/assets/cp1.svg";
import cp2 from "@/assets/cp2.svg";
import cp3 from "@/assets/cp3.svg";
import cp4 from "@/assets/cp4.svg";

const slides = [cp, cp1, cp2, cp3, cp4];

export function ServiceSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleDotClick = (index: number) => {
    swiperRef.current?.slideTo(index);
  };

  return (
    <section className="py-24 md:py-32 overflow-hidden" style={{ background: '#111111' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <span 
          className="block mb-4 antialiased lowercase"
          style={{ 
            color: "#FF4D00", 
            
            fontWeight: 400,
            fontSize: "20px",
            lineHeight: "28px",
            letterSpacing: "0%",
            textAlign: "center"
          }}
        >
          service
        </span>
        <h2 
          className="text-[56px] font-semibold text-white antialiased"
          style={{ 
            
            letterSpacing: "-0.025em"
          }}
        >
          선 넘은 편의성
        </h2>
      </div>

      {/* Slider Container - overflow visible for side images */}
      <div className="relative w-full">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={32}
          slidesPerView="auto"
          centeredSlides={true}
          loop={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full !overflow-visible"
          style={{ overflow: "visible" }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide 
              key={index}
              className="!w-[1260px]"
              style={{ width: "1260px" }}
            >
              <div className="w-full h-[620px] rounded-[16px] overflow-hidden">
                <img
                  src={slide}
                  alt={`서비스 슬라이드 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Controller - separated arrows with centered dots */}
        <div 
          className="flex justify-center items-center mx-auto mt-8 gap-3"
        >
          {/* Left Arrow - Separate circular button */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-[52px] h-[52px] rounded-full transition-colors"
            style={{ backgroundColor: "#3D3D3D" }}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>

          {/* Dots Indicator - Pill-shaped container */}
          <div 
            className="flex items-center justify-center gap-2 px-5"
            style={{ 
              height: "52px", 
              backgroundColor: "#1A1A1A",
              borderRadius: "9999px"
            }}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === index 
                    ? "w-6 h-2.5" 
                    : "w-2.5 h-2.5"
                }`}
                style={{
                  backgroundColor: activeIndex === index ? "#FFFFFF" : "#52525B"
                }}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>

          {/* Right Arrow - Separate circular button */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-[52px] h-[52px] rounded-full transition-colors"
            style={{ backgroundColor: "#3D3D3D" }}
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}