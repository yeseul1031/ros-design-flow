import teamImage from "@/assets/team.png";

const stats = [
  { label: "최장 구독 개월 수", value: "30+" },
  { label: "내부 디자이너 수", value: "52+" },
  { label: "누적 고객사", value: "300+" },
  { label: "누적 프로젝트 수", value: "25,600+" },
];

export function TrustStats() {
  return (
    <section className="bg-black py-24 md:py-32">
      {/* Team Image with Gradient Overlay */}
      <div className="relative w-full h-[600px] mb-16">
        {/* Top gradient fade */}
        <div 
          className="absolute top-0 left-0 right-0 h-40 z-10"
          style={{
            background: "linear-gradient(to bottom, #000000 0%, transparent 100%)"
          }}
        />
        
        {/* Image */}
        <img
          src={teamImage}
          alt="ROS Team"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span 
            className="text-[20px] mb-4"
            style={{ 
              color: "#EB4B29", 
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 400 
            }}
          >
            motto
          </span>
          <h2 
            className="text-[48px] md:text-[56px] text-white text-center"
            style={{ 
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600 
            }}
          >
            좋은 Vibes, 좋은 Results
          </h2>
          <button 
            className="mt-8 px-6 py-3 border border-white/30 rounded-full text-white text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
            style={{ fontFamily: "Pretendard, sans-serif" }}
          >
            View Team
            <span className="text-lg">+</span>
          </button>
        </div>
        
        {/* Bottom gradient fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 z-10"
          style={{
            background: "linear-gradient(to top, #000000 0%, transparent 100%)"
          }}
        />
      </div>

      {/* Stats Section */}
      <div className="max-w-[1260px] mx-auto px-6">
        {/* Header */}
        <div className="text-left mb-[100px]">
          <span 
            className="block mb-4"
            style={{ 
              color: "#EB4B29", 
              fontSize: "20px",
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 400,
              lineHeight: "28px"
            }}
          >
            accumulated data
          </span>
          <h2 
            className="text-white antialiased"
            style={{ 
              fontSize: "56px",
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 600,
              lineHeight: "72px",
              letterSpacing: "-0.025em"
            }}
          >
            숫자로 증명된 신뢰
          </h2>
        </div>

        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-0">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="py-8"
              style={{
                borderTop: "1px solid #333333"
              }}
            >
              <p 
                className="mb-4"
                style={{
                  color: "#A1A1AA",
                  fontSize: "18px",
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 400,
                  lineHeight: "26px",
                  letterSpacing: "-0.025em"
                }}
              >
                {stat.label}
              </p>
              <p 
                className="text-white"
                style={{
                  fontSize: "64px",
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 600,
                  lineHeight: "80px",
                  letterSpacing: "0"
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
