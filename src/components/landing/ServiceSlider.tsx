import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import 컴포넌트 from "@/assets/컴포넌트.png";
import 컴포넌트1 from "@/assets/컴포넌트1.png";
import 컴포넌트2 from "@/assets/컴포넌트2.png";
import 컴포넌트3 from "@/assets/컴포넌트3.png";
import 컴포넌트4 from "@/assets/컴포넌트4.png";

const slides = [컴포넌트, 컴포넌트1, 컴포넌트2, 컴포넌트3, 컴포넌트4];

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
    <section className="py-24 md:py-32 bg-black">
      <div className="max-w-[1260px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span 
            className="text-[20px] font-normal mb-4 block"
            style={{ color: "#FF4D00", fontFamily: "Pretendard, sans-serif" }}
          >
            Service
          </span>
          <h2 
            className="text-[56px] font-semibold text-white"
            style={{ 
              fontFamily: "Pretendard, sans-serif",
              letterSpacing: "-2.5%"
            }}
          >
            선 넘은 편의성
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="w-full h-[620px] rounded-[16px] overflow-hidden"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <img
                  src={slide}
                  alt={`서비스 슬라이드 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Controller */}
          <div className="flex justify-center mt-8">
            <div 
              className="flex items-center justify-between px-4 rounded-full"
              style={{ 
                width: "156px", 
                height: "52px", 
                backgroundColor: "#1A1A1A" 
              }}
            >
              {/* Left Arrow */}
              <button
                onClick={handlePrev}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="이전 슬라이드"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeIndex === index 
                        ? "bg-white" 
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`슬라이드 ${index + 1}로 이동`}
                  />
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={handleNext}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="다음 슬라이드"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
