import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check } from "lucide-react";
import { ServiceSlider } from "@/components/landing/ServiceSlider";
import { TrustStats } from "@/components/landing/TrustStats";
import { PortfolioSection } from "@/components/landing/PortfolioSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { ClientSection } from "@/components/landing/ClientSection";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";
import b1Svg from "@/assets/b1.svg";
import b2Svg from "@/assets/b2.svg";
import orangeSvg from "@/assets/orange.svg";

export default function Index() {
  const logos = ["tvN", "넥슨", "LG U+", "야놀자", "뱅크샐러드", "tvN", "현대", "LG U+", "tvN", "배민", "LG U+"];
  
  const stats = [
    { value: "30+", label: "전문가 수" },
    { value: "52+", label: "프로젝트" },
    { value: "300+", label: "만족도" },
    { value: "25,600+", label: "누적 사용자" },
  ];

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


  const faqItems = [
    { question: "한 번에 얼마나 많은 요청이 가능한가요?", answer: "구독 플랜에 따라 동시에 진행할 수 있는 요청 수가 다릅니다. 스타터 플랜은 1건, 프로 플랜은 2건까지 동시 진행이 가능합니다." },
    { question: "수정 요청은 어떻게 하나요?", answer: "전담 매니저를 통해 언제든지 수정 요청이 가능합니다. 피드백을 주시면 48시간 내에 수정본을 받아보실 수 있습니다." },
    { question: "어떤 종류의 디자인을 제공하나요?", answer: "브랜딩, UI/UX, 웹디자인, 앱디자인, 마케팅 디자인 등 다양한 분야의 디자인을 제공합니다." },
    { question: "계약 기간은 어떻게 되나요?", answer: "월 단위 구독 서비스로, 언제든지 해지가 가능합니다. 최소 계약 기간은 1개월입니다." },
    { question: "디자인 파일은 어떤 형식으로 받나요?", answer: "Figma, Adobe XD, Sketch 등 원하시는 형식으로 제공해 드립니다. 소스 파일도 함께 전달됩니다." },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: '#111111' }}>
      {/* HEADER - Glassmorphism Navigation */}
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
          {/* Left - Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={logoSvg} alt="ROS Logo" className="w-[63px] h-[21px]" />
          </Link>
          
          {/* Right - Menu + Auth Links (all together) */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#team" 
              className="text-white text-base hover:opacity-80 transition-opacity" 
              style={{ fontFamily: 'Pretendard', fontWeight: 100 }}
            >
              TEAM
            </a>
            <a 
              href="#pricing" 
              className="text-white text-base hover:opacity-80 transition-opacity" 
              style={{ fontFamily: 'Pretendard', fontWeight: 100 }}
            >
              PLAN
            </a>
            <Link 
              to="/consultation" 
              className="text-white text-base hover:opacity-80 transition-opacity" 
              style={{ fontFamily: 'Pretendard', fontWeight: 100 }}
            >
              AI MATCHING
            </Link>
            <div className="flex items-center">
              <Link 
                to="/auth" 
                className="text-white text-base hover:opacity-80 transition-opacity" 
                style={{ fontFamily: 'Pretendard', fontWeight: 100 }}
              >
                로그인
              </Link>
              <span className="text-white text-base mx-2" style={{ fontFamily: 'Pretendard', fontWeight: 100 }}>/</span>
              <Link 
                to="/auth" 
                className="text-white text-base hover:opacity-80 transition-opacity" 
                style={{ fontFamily: 'Pretendard', fontWeight: 100 }}
              >
                회원가입
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Fixed Quick Button - Right Side */}
      <a 
        href="/consultation" 
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group cursor-pointer"
      >
        <img 
          src={orangeSvg} 
          alt="Quick Contact" 
          className="w-[52px] h-[170px] transition-all duration-300 group-hover:brightness-0 group-hover:invert"
        />
      </a>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
          <img 
            src="/images/service/hero-2.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        
        <div className="relative z-10 max-w-[1260px] mx-auto px-6 text-center py-32">
          {/* Title - 88px, weight 100 (Thin), line-height 114px */}
          <h1 
            className="text-white mb-6"
            style={{ 
              fontSize: '88px', 
              fontWeight: 100, 
              lineHeight: '114px',
              fontFamily: 'Pretendard'
            }}
          >
            It works like a team.
          </h1>
          
          {/* Subtitle - 18px, weight 100 (Thin), letter-spacing -2.5% */}
          <p 
            className="text-gray-400 mb-10"
            style={{ 
              fontSize: '18px', 
              fontWeight: 100, 
              letterSpacing: '-0.025em',
              fontFamily: 'Pretendard'
            }}
          >
            일하다 보면 팀처럼, 디자이너 구독 서비스
          </p>
          
          {/* Buttons - Glassmorphism effect like AI MATCHING+ button */}
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/consultation" 
              className="relative flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
              style={{ 
                width: '140px', 
                height: '52px',
                borderRadius: '225px',
                background: 'radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: 'inset 0px 0px 38.8px 0px rgba(255, 255, 255, 0.1), 0px 80px 100px -19px rgba(0, 0, 0, 0.25)',
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '16px'
              }}
            >
              {/* Gradient border overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%)',
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <span className="relative z-10">플랜 확인</span>
            </Link>
            <Link 
              to="/consultation" 
              className="relative flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 hover:scale-105"
              style={{ 
                width: '160px', 
                height: '52px',
                borderRadius: '225px',
                background: 'radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: 'inset 0px 0px 38.8px 0px rgba(255, 255, 255, 0.1), 0px 80px 100px -19px rgba(0, 0, 0, 0.25)',
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '16px'
              }}
            >
              {/* Gradient border overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%)',
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <span className="relative z-10">구독 문의 ✱</span>
            </Link>
          </div>
        </div>
      </section>

      {/* LOGO TICKER */}
      <section className="py-12 border-y border-gray-800 overflow-hidden">
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <span key={i} className="mx-8 text-gray-500 text-lg font-medium whitespace-nowrap">
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* SERVICE SLIDER SECTION */}
      <ServiceSlider />

      {/* TRUST STATS SECTION */}
      <TrustStats />

      {/* PORTFOLIO SECTION - Infinite Marquee */}
      <PortfolioSection />

      {/* PROCESS SECTION */}
      <ProcessSection />

      {/* CLIENT SECTION */}
      <ClientSection />

      <section id="pricing" className="py-24 md:py-32 bg-[#f5f5f5] text-[#0a0a0a]">
        <div className="max-w-[1260px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">가격은 간단하게</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                className={`bg-white rounded-2xl p-8 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-4 py-1 rounded-full">
                    인기
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full rounded-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-gray-900 hover:bg-gray-800'}`}
                  asChild
                >
                  <Link to="/consultation">시작하기</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ SECTION */}
      <section id="faq" className="py-24 md:py-32 bg-white text-[#0a0a0a]">
        <div className="max-w-[1260px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">자주 묻는 질문</h2>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`}
                  className="border border-gray-200 rounded-xl px-6 data-[state=open]:bg-gray-50"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA / CONTACT SECTION */}
      <section className="py-24 md:py-32 bg-[#0a0a0a]">
        <div className="max-w-[1260px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">이제 시작할 차례</h2>
              <div className="bg-primary rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Contact</h3>
                <p className="text-white/80 mb-6">
                  프로젝트에 대해 상담받고 싶으시다면<br />
                  언제든지 연락주세요.
                </p>
                <div className="space-y-2 text-white/80">
                  <p>manager@rosdesigns.com</p>
                  <p>010-2166-5594</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#141414] rounded-2xl p-8">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">이름</label>
                  <Input 
                    placeholder="이름을 입력하세요" 
                    className="bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">이메일</label>
                  <Input 
                    type="email"
                    placeholder="이메일을 입력하세요" 
                    className="bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">연락처</label>
                  <Input 
                    placeholder="연락처를 입력하세요" 
                    className="bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">문의 내용</label>
                  <Textarea 
                    placeholder="문의 내용을 입력하세요" 
                    className="bg-[#0a0a0a] border-gray-800 text-white placeholder:text-gray-600 min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-white text-[#0a0a0a] hover:bg-gray-100 rounded-full py-6">
                  문의하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] border-t border-gray-800">
        <div className="max-w-[1260px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                Everything you<br />
                need in one subscription.
              </h2>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm mb-4">© ROS. All rights reserved.</p>
              <div className="text-gray-500 text-sm space-y-1">
                <p>주식회사 알오에스 | 사업자등록번호: 877-87-03752</p>
                <p>대표자: 최인나 | 서울시 중구 난계로 207</p>
                <p>manager@rosdesigns.com | 010-2166-5594</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
