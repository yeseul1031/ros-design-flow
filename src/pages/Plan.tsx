import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";

const pricingPlans = [
  {
    name: "스타터",
    price: "₩ 1,500,000",
    period: "/월",
    description: "작은 규모의 팀을 위한 기본 플랜",
    features: ["디자이너 1명 배정", "무제한 요청", "48시간 내 초안", "기본 수정 2회"],
    popular: false,
  },
  {
    name: "프로",
    price: "₩ 2,500,000",
    period: "/월",
    description: "성장하는 브랜드를 위한 프로 플랜",
    features: ["디자이너 1명 배정", "무제한 요청", "24시간 내 초안", "무제한 수정", "전담 매니저"],
    popular: true,
  },
  {
    name: "엔터프라이즈",
    price: "문의",
    period: "",
    description: "대규모 프로젝트를 위한 맞춤 플랜",
    features: ["디자이너 팀 배정", "무제한 요청", "24시간 내 초안", "무제한 수정", "전담 매니저", "우선 지원"],
    popular: false,
  },
];

export default function Plan() {
  return (
    <div className="min-h-screen text-white" style={{ background: '#111111' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-6">
        <nav 
          className="w-full max-w-[1872px] h-16 flex items-center justify-between px-8 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0px 0px 12px 0px rgba(255, 255, 255, 0.1)',
          }}
        >
          <Link to="/" className="flex-shrink-0">
            <img src={logoSvg} alt="ROS Logo" className="w-[63px] h-[21px]" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#team" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>TEAM</Link>
            <Link to="/plan" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>PLAN</Link>
            <Link to="/consultation" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>AI MATCHING</Link>
            <div className="flex items-center">
              <Link to="/auth" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>로그인</Link>
              <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
              <Link to="/auth" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>회원가입</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="pt-32 pb-24">
        <div className="max-w-[1260px] mx-auto px-6">
          {/* Section Header */}
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
              plan
            </span>
            <h1
              className="text-white antialiased"
              style={{
                fontWeight: 600,
                fontSize: "56px",
                lineHeight: "72px",
                letterSpacing: "-0.025em",
              }}
            >
              가격은 간단하게
            </h1>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                className={`bg-[#1E1E1E] rounded-2xl p-8 relative ${plan.popular ? 'ring-2 ring-[#EB4B29]' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EB4B29] text-white text-xs font-medium px-4 py-1 rounded-full">
                    인기
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white">
                      <Check className="w-4 h-4 text-[#EB4B29]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full rounded-full ${plan.popular ? 'bg-[#EB4B29] hover:bg-[#EB4B29]/90' : 'bg-white text-[#111111] hover:bg-gray-200'}`}
                  asChild
                >
                  <Link to="/consultation">시작하기</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
