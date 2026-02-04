import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import cp from "@/assets/cp.png";
import cp1 from "@/assets/cp1.png";
import cp2 from "@/assets/cp2.png";
import cp3 from "@/assets/cp3.png";
import cp4 from "@/assets/cp4.png";

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
    <section className="py-24 md:py-32 bg-black overflow-hidden">
      {/* Header */}
      <div className="text-center mb-12">
        <span 
          className="text-[20px] font-normal mb-4 block antialiased lowercase"
          style={{ color: "#FF4D00", fontFamily: "Pretendard, sans-serif" }}
        >
          service
        </span>
        <h2 
          className="text-[56px] font-semibold text-white antialiased"
          style={{ 
            fontFamily: "Pretendard, sans-serif",
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

        {/* Custom Controller - 3 separate boxes */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {/* Left Arrow Box */}
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-[52px] h-[52px] rounded-full transition-colors"
            style={{ backgroundColor: "#1A1A1A" }}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-5 h-5 text-white/60 hover:text-white" strokeWidth={1.5} />
          </button>

          {/* Dots Indicator Box */}
          <div 
            className="flex items-center justify-center gap-1.5 px-4"
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
                className={`transition-all duration-300 ${
                  activeIndex === index 
                    ? "w-5 h-2 rounded-full bg-white" 
                    : "w-2 h-2 rounded-full"
                }`}
                style={{
                  backgroundColor: activeIndex === index ? "#FFFFFF" : "#52525B"
                }}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>

          {/* Right Arrow Box */}
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-[52px] h-[52px] rounded-full transition-colors"
            style={{ backgroundColor: "#1A1A1A" }}
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-5 h-5 text-white/60 hover:text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}