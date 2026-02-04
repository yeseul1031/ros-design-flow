import { useState } from "react";

// Import phone mockup images
import mok1 from "@/assets/mok1.svg";
import mok1Hover from "@/assets/mok1.1.svg";
import mok2 from "@/assets/mok2.svg";
import mok2Hover from "@/assets/mok2.1.svg";
import mok3 from "@/assets/mok3.svg";
import mok3Hover from "@/assets/mok3.1.svg";

interface ProcessCardProps {
  title: string;
  description: string;
  imageDefault: string;
  imageHover: string;
}

function ProcessCard({ title, description, imageDefault, imageHover }: ProcessCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: "398.67px",
        height: "520px",
        backgroundColor: "#1E1E1E",
        borderRadius: "16px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Text Content */}
      <div className="p-8">
        <h3
          style={{
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 400,
            fontSize: "28px",
            lineHeight: "38px",
            letterSpacing: "-0.025em",
            color: "#FFFFFF",
            marginBottom: "12px",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "-0.025em",
            color: "#FFFFFFCC",
          }}
        >
          {description}
        </p>
      </div>

      {/* Phone Mockup Container */}
      <div
        className="absolute bottom-0 w-full flex justify-center"
        style={{
          transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          transform: isHovered ? "translateY(0)" : "translateY(0)",
        }}
      >
        {/* Default Image - shown when not hovered */}
        <img
          src={imageDefault}
          alt={`${title} - default`}
          className="w-auto h-auto max-w-[280px] mx-auto"
          style={{
            opacity: isHovered ? 0 : 1,
            transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            display: isHovered ? "none" : "block",
          }}
        />
        {/* Hover Image - shown when hovered */}
        <img
          src={imageHover}
          alt={`${title} - hover`}
          className="w-auto h-auto max-w-[280px] mx-auto"
          style={{
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            display: isHovered ? "block" : "none",
          }}
        />
      </div>
    </div>
  );
}

const processCards = [
  {
    title: "구독 신청",
    description: "구독 기간과 구독 시작일을 선택합니다.",
    imageDefault: mok1,
    imageHover: mok1Hover,
  },
  {
    title: "서류 전달",
    description: "세금계산서 및 서류 수신용 이메일을 입력합니다.",
    imageDefault: mok2,
    imageHover: mok2Hover,
  },
  {
    title: "구독 시작",
    description: "결제 후 시작일 오전 10시부터 업무가 시작됩니다.",
    imageDefault: mok3,
    imageHover: mok3Hover,
  },
];

export function ProcessSection() {
  return (
    <section className="bg-black py-[120px]">
      <div className="max-w-[1260px] mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <span
            className="block mb-4"
            style={{
              color: "#EB4B29",
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "28px",
            }}
          >
            process
          </span>
          <h2
            className="text-white antialiased"
            style={{
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 400,
              fontSize: "56px",
              lineHeight: "72px",
              letterSpacing: "-0.025em",
            }}
          >
            과정은 간단하게
          </h2>
        </div>

        {/* Card Grid */}
        <div
          className="flex justify-between"
          style={{ gap: "32px" }}
        >
          {processCards.map((card, index) => (
            <ProcessCard
              key={index}
              title={card.title}
              description={card.description}
              imageDefault={card.imageDefault}
              imageHover={card.imageHover}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
