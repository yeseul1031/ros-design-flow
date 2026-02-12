import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check, Upload } from "lucide-react";
import { ServiceSlider } from "@/components/landing/ServiceSlider";
import { TrustStats } from "@/components/landing/TrustStats";
import { PortfolioSection } from "@/components/landing/PortfolioSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { ClientSection } from "@/components/landing/ClientSection";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";
import button1Svg from "@/assets/1.svg";
import button2Svg from "@/assets/2.svg";
import orangeSvg from "@/assets/orange.svg";
import heroVideo from "@/assets/hero.mp4";

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
              className="text-white hover:opacity-80 transition-opacity" 
              style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}
            >
              TEAM
            </a>
            <a 
              href="#pricing" 
              className="text-white hover:opacity-80 transition-opacity" 
              style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}
            >
              PLAN
            </a>
            <Link 
              to="/consultation" 
              className="text-white hover:opacity-80 transition-opacity" 
              style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}
            >
              AI MATCHING
            </Link>
            <div className="flex items-center">
              <Link 
                to="/auth" 
                className="text-white hover:opacity-80 transition-opacity" 
                style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}
              >
                로그인
              </Link>
              <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
              <Link 
                to="/auth" 
                className="text-white hover:opacity-80 transition-opacity" 
                style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}
              >
                회원가입
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Fixed Quick Button - Right Side (right-0, centered vertically) */}
      <a 
        href="/consultation" 
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group cursor-pointer"
      >
        <svg 
          width="52" 
          height="170" 
          viewBox="0 0 52 170" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-[52px] h-[170px]"
        >
          {/* Orange background - stays orange */}
          <rect width="170" height="52" transform="translate(0 170) rotate(-90)" fill="#EB4B29"/>
          {/* Text path - white by default, black on hover */}
          <path 
            className="fill-white transition-colors duration-300 group-hover:fill-black"
            d="M24.5 145.633C23.1406 145.875 22.3594 146.961 22.3594 148.336C22.3594 150.188 23.7813 151.5 26.3438 151.492C28.9453 151.5 30.3281 150.18 30.3281 148.336C30.3281 146.992 29.5781 145.906 28.25 145.633L28.25 143.586C30.4219 143.898 32.1563 145.688 32.1563 148.367C32.1563 151.352 29.9922 153.547 26.3438 153.539C22.6875 153.547 20.5313 151.328 20.5313 148.367C20.5313 145.867 21.9844 143.938 24.5 143.586L24.5 145.633ZM32.1719 138.227C32.1719 140.703 30.4141 142.289 27.7969 142.289C25.1563 142.289 23.4063 140.703 23.4063 138.227C23.4063 135.742 25.1563 134.156 27.7969 134.164C30.4141 134.156 32.1719 135.742 32.1719 138.227ZM27.7813 140.273C29.3359 140.273 30.5781 139.594 30.5781 138.211C30.5781 136.852 29.3359 136.172 27.7813 136.18C26.2266 136.172 24.9766 136.852 24.9844 138.211C24.9766 139.594 26.2266 140.273 27.7813 140.273ZM27.0313 130.617L32 130.617L32 132.617L23.5156 132.617L23.5156 130.711L24.9531 130.711L24.9531 130.602C24.0078 130.219 23.4063 129.352 23.4063 128.086C23.4063 126.328 24.5625 125.172 26.5938 125.18L32 125.18L32 127.164L26.9063 127.164C25.7656 127.164 25.0859 127.781 25.0938 128.82C25.0859 129.875 25.7969 130.617 27.0313 130.617ZM23.5156 119.039L25.0469 119.039L25.0469 120.711L29.4531 120.711C30.2656 120.711 30.4297 120.305 30.4375 119.805C30.4453 119.57 30.4219 119.18 30.4063 118.93L32.0313 118.93C32.0703 119.164 32.1172 119.547 32.1094 120.055C32.1172 121.555 31.375 122.711 29.7813 122.695L25.0469 122.695L25.0469 123.914L23.5156 123.914L23.5156 122.695L21.4844 122.695L21.4844 120.711L23.5156 120.711L23.5156 119.039ZM29.6094 117.898C27.7031 117.898 27.1484 116.313 27.0469 114.742C27 114.148 26.9453 112.938 26.9297 112.563L26.25 112.57C25.4063 112.57 24.9219 113.109 24.9219 114.102C24.9219 114.992 25.3281 115.539 25.9375 115.695L25.9375 117.617C24.4922 117.477 23.4063 116.18 23.4063 114.055C23.4063 112.445 24.0703 110.586 26.3281 110.586L32 110.586L32 112.492L30.8281 112.492L30.8281 112.555C31.5469 112.93 32.1719 113.719 32.1719 115.055C32.1719 116.672 31.2891 117.898 29.6094 117.898ZM29.5938 115.977C30.3281 115.977 30.7031 115.375 30.7031 114.539C30.7031 113.328 29.9063 112.555 28.9531 112.555L28.2578 112.563C28.2734 112.922 28.3438 114.031 28.375 114.43C28.4531 115.375 28.8516 115.977 29.5938 115.977ZM32.1719 105.008C32.1719 107.539 30.3594 109.07 27.7969 109.07C25.1953 109.07 23.4063 107.492 23.4063 105.008C23.4063 102.953 24.6094 101.508 26.4375 101.367L26.4375 103.273C25.625 103.43 25.0078 104.023 25 104.992C25.0078 106.227 26.0391 107.055 27.75 107.055C29.5 107.055 30.5391 106.242 30.5469 104.992C30.5391 104.109 30.0234 103.453 29.1094 103.273L29.1094 101.367C30.8984 101.516 32.1719 102.875 32.1719 105.008ZM23.5156 95.6328L25.0469 95.6328L25.0469 97.3047L29.4531 97.3047C30.2656 97.3047 30.4297 96.8984 30.4375 96.3984C30.4453 96.1641 30.4219 95.7734 30.4063 95.5234L32.0313 95.5234C32.0703 95.7578 32.1172 96.1406 32.1094 96.6484C32.1172 98.1484 31.375 99.3047 29.7813 99.2891L25.0469 99.2891L25.0469 100.508L23.5156 100.508L23.5156 99.2891L21.4844 99.2891L21.4844 97.3047L23.5156 97.3047L23.5156 95.6328ZM32.125 92.8672C32.125 93.5391 31.5781 94.0938 30.9063 94.0859C30.25 94.0938 29.7109 93.5391 29.7031 92.8672C29.7109 92.2188 30.25 91.6641 30.9063 91.6641C31.5781 91.6641 32.125 92.2188 32.125 92.8672Z"
          />
          {/* Star icon path - white by default, black on hover */}
          <path 
            className="fill-white transition-colors duration-300 group-hover:fill-black"
            d="M24.6251 15.5L24.6251 23.1805L19.1942 17.7496L17.2496 19.6942L22.6805 25.1251L15 25.1251L15 27.8749L22.6805 27.8749L17.2496 33.3058L19.1942 35.2504L24.6251 29.8195L24.6251 37.5L27.3752 37.5L27.3752 29.8195L32.8061 35.2504L34.7507 33.3058L29.3195 27.8749L37 27.8749L37 25.1251L29.3195 25.1251L34.7507 19.6942L32.8061 17.7496L27.3752 23.1805L27.3752 15.5L24.6251 15.5Z"
          />
        </svg>
      </a>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-[1260px] mx-auto px-6 text-center py-32">
          {/* Title - 88px, weight 100 (Thin), line-height 114px */}
          <h1 
            className="text-white mb-6"
            style={{ 
              fontSize: '88px', 
              fontWeight: 600, 
              lineHeight: '114px',
            }}
          >
            It works like a team.
          </h1>
          
          {/* Subtitle - 18px, weight 100 (Thin), letter-spacing -2.5% */}
          <p 
            className="mb-16"
            style={{ 
              fontSize: '18px', 
              fontWeight: 400, 
              letterSpacing: '-0.025em',
              lineHeight: '26px',
              color: '#FFFFFF'
            }}
          >
            일하다 보면 팀처럼, 디자이너 구독 서비스
          </p>
          
          {/* Buttons - AI MATCHING style buttons */}
          <div className="flex items-center justify-center gap-[16px]">
            {/* 플랜 확인 버튼 */}
            <Link 
              to="/service" 
              className="relative overflow-hidden transition-all duration-300 hover:scale-105 flex items-center justify-center"
              style={{
                width: "140px",
                height: "56px",
                borderRadius: "225px",
                background:
                  "radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow:
                  "inset 0px 0px 38.8px 0px rgba(255, 255, 255, 0.1), 0px 80px 100px -19px rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Gradient border overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%)",
                  padding: "1px",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <span
                className="relative z-10"
                style={{
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                플랜 확인
              </span>
            </Link>
            
            {/* 구독 문의 버튼 */}
            <Link 
              to="/consultation" 
              className="relative overflow-hidden transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              style={{
                width: "160px",
                height: "56px",
                borderRadius: "225px",
                background:
                  "radial-gradient(100% 100% at 0% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow:
                  "inset 0px 0px 38.8px 0px rgba(255, 255, 255, 0.1), 0px 80px 100px -19px rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Gradient border overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%)",
                  padding: "1px",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
              <span
                className="relative z-10"
                style={{
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                구독 문의
              </span>
              {/* Star icon */}
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 512 512" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
              >
                <path d="M512 224.002H333.254L459.645 97.611L414.389 52.355L287.998 178.746V0H224.002V178.746L97.611 52.355L52.355 97.611L178.746 224.002H0V288.005H178.746L52.355 414.396L97.611 459.652L224.002 333.254V512H287.998V333.254L414.389 459.652L459.645 414.396L333.254 288.005H512V224.002Z" fill="white"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* LOGO TICKER */}
      <section className="py-12 overflow-hidden">
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

      <section id="pricing" className="py-24 md:py-32" style={{ background: '#111111' }}>
        <div className="max-w-[1260px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">가격은 간단하게</h2>
          
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
      </section>


      {/* FAQ SECTION */}
      <section id="faq" className="py-24 md:py-32" style={{ background: '#111111' }}>
        <div className="max-w-[1260px] mx-auto px-6">
          {/* FAQ Label */}
          <p 
            className="text-center mb-4"
            style={{ 
              color: '#EB4B29', 
              fontSize: '20px', 
              fontWeight: 400,
              lineHeight: '28px'
            }}
          >
            FAQ
          </p>
          
          {/* Title */}
          <h2 
            className="text-center mb-16"
            style={{ 
              color: '#FFFFFF', 
              fontSize: '56px', 
              fontWeight: 600,
              lineHeight: '72px',
              letterSpacing: '-0.025em'
            }}
          >
            자주 묻는 질문
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`}
                  className="border-b border-[#333333] first:border-t"
                >
                  <AccordionTrigger 
                    className="text-left hover:no-underline py-6 text-white"
                    style={{ 
                      fontWeight: 400,
                      fontSize: '18px'
                    }}
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent 
                    className="pb-6"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 300,
                      fontSize: '16px'
                    }}
                  >
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA / CONTACT SECTION */}
      <section className="py-24 md:py-32" style={{ background: '#111111' }}>
        <div className="max-w-[1260px] mx-auto px-6">
          {/* Contact Label */}
          <p 
            className="mb-4"
            style={{ 
              color: '#EB4B29', 
              fontSize: '20px', 
              fontWeight: 400,
              lineHeight: '28px'
            }}
          >
            contact
          </p>
          
          {/* Title */}
          <h2 
            className="mb-12"
            style={{ 
              color: '#FFFFFF', 
              fontSize: '56px', 
              fontWeight: 600,
              lineHeight: '72px',
              letterSpacing: '-0.025em'
            }}
          >
            이제 시작할 차례
          </h2>

          <div className="flex gap-6 items-stretch">
            {/* Left Contact Box */}
            <div 
              className="flex flex-col p-8 flex-shrink-0"
              style={{
                width: '380px',
                minHeight: '600px',
                borderRadius: '12px',
                background: 'linear-gradient(360deg, #DAF0FF 0%, #EB4B29 71.65%)',
              }}
            >
              <div>
                <h3 
                  style={{ 
                    fontWeight: 600,
                    fontSize: '40px',
                    lineHeight: '52px',
                    color: '#FFFFFF'
                  }}
                >
                  Contact
                </h3>
                <div 
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginTop: '16px'
                  }}
                >
                  <p 
                    style={{ 
                      fontWeight: 200,
                      fontSize: '16px',
                      color: '#FFFFFF'
                    }}
                  >
                    010-2166-5594
                  </p>
                  <p 
                    style={{ 
                      fontWeight: 200,
                      fontSize: '16px',
                      color: '#FFFFFF'
                    }}
                  >
                    manager@rosdesigns.com
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Form Section */}
            <div className="flex-1">
              <form className="space-y-5">
                {/* 회사/단체명 */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    회사/단체명 <span style={{ color: '#EB4B29' }}>*</span>
                  </label>
                  <Input 
                    placeholder="회사/단체명을 입력해 주세요" 
                    className="bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500 h-12 rounded-lg"
                  />
                </div>

                {/* 이름 */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    이름 <span style={{ color: '#EB4B29' }}>*</span>
                  </label>
                  <Input 
                    placeholder="담당자님의 이름을 입력해 주세요" 
                    className="bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500 h-12 rounded-lg"
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    이메일 <span style={{ color: '#EB4B29' }}>*</span>
                  </label>
                  <Input 
                    type="email"
                    placeholder="이메일을 입력해 주세요" 
                    className="bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500 h-12 rounded-lg"
                  />
                </div>

                {/* 연락처 */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    연락처 <span style={{ color: '#EB4B29' }}>*</span>
                  </label>
                  <Input 
                    placeholder="-없이 입력 (ex.01012345678)" 
                    className="bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500 h-12 rounded-lg"
                  />
                </div>

                {/* 문의내용 */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    문의내용
                  </label>
                  <Textarea 
                    placeholder="ROS에 문의하실 내용을 자유롭게 작성해 주세요" 
                    className="bg-[#1E1E1E] border-[#333333] text-white placeholder:text-gray-500 min-h-[140px] rounded-lg resize-none"
                  />
                </div>

                {/* 첨부파일 */}
                <div>
                  <label 
                    className="block mb-2"
                    style={{ 
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    첨부파일
                  </label>
                  <div 
                    className="flex items-center gap-3 px-4 h-12 rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors"
                    style={{ 
                      background: '#1E1E1E',
                      border: '1px solid #333333'
                    }}
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span 
                      style={{ 
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#6B7280'
                      }}
                    >
                      첨부 파일 업로드 / 최대 50MB
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  className="w-full h-12 rounded-lg text-base font-medium"
                  style={{ 
                    background: '#3D3D3D',
                    color: '#FFFFFF',
                    fontWeight: 500
                  }}
                >
                  ROS에 문의 보내기
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#1A1A1A', borderTop: '1px solid #333333' }}>
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          {/* Top Row */}
          <div className="flex justify-between items-start mb-8">
            <h2 
              className="text-3xl md:text-4xl leading-tight text-white"
              style={{ 
                fontWeight: 300,
                letterSpacing: '-0.02em'
              }}
            >
              Everything you<br />
              need in one subscription.
            </h2>
            
            {/* Social Links */}
            <div className="flex items-center gap-2 text-sm" style={{ color: '#999999' }}>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <span>•</span>
              <a 
                href="https://pf.kakao.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Kakao Talk
              </a>
              <span>•</span>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
          
          {/* Company Info */}
          <div className="text-sm mb-2" style={{ color: '#666666' }}>
            <p>(주)알오에스 | 대표 최인나 |</p>
          </div>
          <div className="text-sm mb-6" style={{ color: '#666666' }}>
            <p>사업자등록번호 877-87-03752 | 경기 남양주시 별내3로 322 (별내동) 404 | 010-2166-5594 | manager@rosdesigns.com</p>
          </div>
          
          {/* Bottom Row */}
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: '#666666' }}>
              ©ROS. All rights reserved.
            </p>
            
            {/* Policy Links */}
            <div className="flex items-center gap-8 text-sm" style={{ color: '#999999' }}>
              <a 
                href="/terms" 
                className="hover:text-white transition-colors"
              >
                이용약관
              </a>
              <a 
                href="/privacy" 
                className="hover:text-white transition-colors"
              >
                개인정보 처리방침
              </a>
              <a 
                href="/refund" 
                className="hover:text-white transition-colors"
              >
                취소/환불 정책
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
