import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";
import planBtnSvg from "@/assets/planb.svg";
import planCardSvg from "@/assets/plan.svg";

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
  const [planType, setPlanType] = useState<'general' | 'premium'>('general');

  return (
    <div className="min-h-screen text-white" style={{ background: '#111111' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-6">
        <nav 
          className="w-full max-w-[1872px] h-16 flex items-center justify-between rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid transparent',
            borderImage: 'linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
            borderImageSlice: '1',
            boxShadow: 'inset 0px 0px 12px 0px rgba(255, 255, 255, 0.1)',
            padding: '20px 24px',
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
          <div 
            className="flex flex-col items-center justify-center mx-auto mb-16"
            style={{ maxWidth: '1260px', width: '100%', height: '196px', gap: '24px' }}
          >
            <span
              className="block"
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
              유연한 구독플랜
            </h1>
            {/* Toggle Buttons - using planb.svg as base */}
            <div 
              className="relative cursor-pointer"
              style={{ width: '280px', height: '60px', borderRadius: '6px', padding: '8px' }}
            >
              <img src={planBtnSvg} alt="" className="absolute inset-0 w-full h-full" style={{ borderRadius: '6px' }} />
              <div className="relative flex items-center h-full w-full" style={{ gap: '0px' }}>
                <button
                  onClick={() => setPlanType('general')}
                  className="flex-1 h-full flex items-center justify-center transition-colors z-10"
                  style={{
                    borderRadius: '6px',
                    color: planType === 'general' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    background: planType === 'general' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    fontSize: '16px',
                    fontWeight: 400,
                  }}
                >
                  일반
                </button>
                <button
                  onClick={() => setPlanType('premium')}
                  className="flex-1 h-full flex items-center justify-center transition-colors z-10"
                  style={{
                    borderRadius: '6px',
                    color: planType === 'premium' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    background: planType === 'premium' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                    fontSize: '16px',
                    fontWeight: 400,
                  }}
                >
                  프리미엄
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards - using plan.svg */}
          <div 
            className="flex justify-center mx-auto"
            style={{ maxWidth: '1260px', width: '100%', height: '372px', gap: '32px' }}
          >
            {[0, 1, 2].map((i) => (
              <img 
                key={i} 
                src={planCardSvg} 
                alt={`요금제 ${i + 1}`}
                style={{ 
                  width: '398.67px', 
                  height: '372px', 
                  borderRadius: '16px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#1A1A1A', borderTop: '1px solid #333333' }}>
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-8">
            <h2 
              className="text-white"
              style={{ fontWeight: 600, fontSize: '56px', lineHeight: '72px', letterSpacing: '0' }}
            >
              Everything you<br />
              need in one subscription.
            </h2>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#999999' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <span>•</span>
              <a href="https://pf.kakao.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kakao Talk</a>
              <span>•</span>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="text-sm mb-2" style={{ color: '#666666' }}>
            <p>(주)알오에스 | 대표 최인나 |</p>
          </div>
          <div className="text-sm mb-6" style={{ color: '#666666' }}>
            <p>사업자등록번호 877-87-03752 | 경기 남양주시 별내3로 322 (별내동) 404 | 010-2166-5594 | manager@rosdesigns.com</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: '#666666' }}>©ROS. All rights reserved.</p>
            <div className="flex items-center gap-8 text-sm" style={{ color: '#999999' }}>
              <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
              <a href="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</a>
              <a href="/refund" className="hover:text-white transition-colors">취소/환불 정책</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
