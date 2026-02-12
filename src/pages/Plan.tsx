import { useState } from "react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";
import planCardSvg from "@/assets/plan.svg";
import planNoSvg from "@/assets/plan-no.svg";
import planPrSvg from "@/assets/plan-pr.svg";

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
      <div 
        className="flex flex-col items-center"
        style={{ 
          maxWidth: '1920px', 
          width: '100%',
          minHeight: '1000px',
          gap: '76px',
          paddingTop: '120px',
          paddingRight: '24px',
          paddingBottom: '160px',
          paddingLeft: '24px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <div 
          className="flex flex-col items-center justify-center"
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

          {/* Toggle Button - HTML/CSS */}
          <div 
            className="relative flex items-center cursor-pointer select-none"
            style={{ 
              width: '280px', 
              height: '60px', 
              borderRadius: '6px',
              background: '#1E1E1E',
              padding: '8px',
            }}
          >
            {/* Sliding highlight */}
            <div
              className="absolute transition-transform duration-300 ease-in-out"
              style={{
                width: '132px',
                height: '44px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.16)',
                top: '8px',
                left: '8px',
                transform: planType === 'premium' ? 'translateX(132px)' : 'translateX(0)',
              }}
            />
            <button
              onClick={() => setPlanType('general')}
              className="relative z-10 flex-1 h-full flex items-center justify-center transition-opacity duration-300"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                opacity: planType === 'general' ? 1 : 0.6,
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '-0.025em',
              }}
            >
              일반
            </button>
            <button
              onClick={() => setPlanType('premium')}
              className="relative z-10 flex-1 h-full flex items-center justify-center transition-opacity duration-300"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                opacity: planType === 'premium' ? 1 : 0.6,
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '-0.025em',
              }}
            >
              프리미엄
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div 
          className="flex justify-center items-end"
          style={{ maxWidth: '1260px', width: '100%', gap: '32px' }}
        >
          {/* Card 1 - HTML */}
          <div
            className="relative flex flex-col justify-between"
            style={{
              width: '398.67px',
              height: '372px',
              borderRadius: '16px',
              background: '#1E1E1E',
              padding: '32px',
            }}
          >
            <div className="flex flex-col" style={{ gap: '12px' }}>
              <span style={{
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '26px',
                letterSpacing: '-0.025em',
                color: 'rgba(255, 255, 255, 0.8)',
              }}>
                1개월
              </span>
              <span style={{
                fontWeight: 600,
                fontSize: '40px',
                lineHeight: '52px',
                letterSpacing: '-0.025em',
                color: 'white',
                background: 'linear-gradient(135deg, #EB4B29, #FFDDD5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                130만원
              </span>
              <span style={{
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '22px',
                letterSpacing: '-0.025em',
                color: '#FFFFFFCC',
              }}>
                ✳ 최소 1개월부터 가볍게 시작
              </span>
            </div>
            {/* Subscribe button */}
            <div className="flex justify-center">
              <button
                className="flex items-center justify-center"
                style={{
                  width: '103px',
                  height: '56px',
                  borderRadius: '28px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 400,
                  backdropFilter: 'blur(4px)',
                }}
              >
                구독하기
              </button>
            </div>
          </div>

          {/* Card 2 - SVG (middle, changes based on toggle) */}
          <div className="relative" style={{ width: '398.67px' }}>
            <img 
              src={planType === 'general' ? planNoSvg : planPrSvg}
              alt="요금제 2"
              style={{ 
                width: '398.67px',
                display: 'block',
              }}
            />
          </div>

          {/* Card 3 - HTML */}
          <div
            className="relative flex flex-col justify-between"
            style={{
              width: '398.67px',
              height: '372px',
              borderRadius: '16px',
              background: '#1E1E1E',
              padding: '32px',
            }}
          >
            <div className="flex flex-col" style={{ gap: '12px' }}>
              <span style={{
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '26px',
                letterSpacing: '-0.025em',
                color: 'rgba(255, 255, 255, 0.8)',
              }}>
                6개월
              </span>
              <span style={{
                fontWeight: 600,
                fontSize: '40px',
                lineHeight: '52px',
                letterSpacing: '-0.025em',
                color: 'white',
                background: 'linear-gradient(135deg, #EB4B29, #FFDDD5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                690만원
              </span>
              <span style={{
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '22px',
                letterSpacing: '-0.025em',
                color: '#FFFFFFCC',
              }}>
                ✳ 장기 프로젝트에 최적화된 플랜
              </span>
            </div>
            {/* Subscribe button */}
            <div className="flex justify-center">
              <button
                className="flex items-center justify-center"
                style={{
                  width: '103px',
                  height: '56px',
                  borderRadius: '28px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 400,
                  backdropFilter: 'blur(4px)',
                }}
              >
                구독하기
              </button>
            </div>
          </div>
        </div>

        {/* VAT Notice */}
        <p style={{
          width: '341px',
          height: '24px',
          opacity: 0.5,
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '24px',
          letterSpacing: '-0.025em',
          color: '#FFFFFF',
        }}>
          * 표기된 모든 금액은 부가가치세(VAT) 10% 별도입니다.
        </p>
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
