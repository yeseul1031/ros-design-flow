import teamImage from "@/assets/team.png";

const stats = [
  { label: "최장 구독 개월 수", value: "30+" },
  { label: "내부 디자이너 수", value: "52+" },
  { label: "누적 고객사", value: "300+" },
  { label: "누적 프로젝트 수", value: "25,600+" },
];

export function TrustStats() {
  return (
    <section style={{ background: '#111111' }} className="py-24 md:py-32">
      {/* Team Image with Gradient Overlay */}
      <div className="relative w-full h-[600px] mb-16">
        {/* Top gradient fade */}
        <div 
          className="absolute top-0 left-0 right-0 h-40 z-10"
          style={{
            background: "linear-gradient(to bottom, #111111 0%, transparent 100%)"
          }}
        />
        
        {/* Image */}
        <img
          src={teamImage}
          alt="ROS Team"
          className="w-full h-full object-cover"
        />
        
        {/* Bottom gradient fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 z-10"
          style={{
            background: "linear-gradient(to top, #111111 0%, transparent 100%)"
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
              
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0%"
            }}
          >
            accumulated data
          </span>
          <h2 
            className="text-white antialiased"
            style={{ 
              fontSize: "56px",
              
              fontWeight: 300,
              lineHeight: "1.4",
              letterSpacing: "-0.005em"
            }}
          >
            숫자로 증명된 신뢰
          </h2>
        </div>

        {/* Stats Grid - 2x2 with separate lines */}
        <div className="grid grid-cols-2 gap-x-16">
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
                  color: "#FFFFFFCC",
                  fontSize: "18px",
                  
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
                  
                  fontWeight: 300,
                  lineHeight: "1.35",
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
