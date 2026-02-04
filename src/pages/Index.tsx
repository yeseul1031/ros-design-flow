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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-[1260px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white">ROS</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">서비스 소개</a>
            <a href="#pricing" className="hover:text-white transition-colors">요금제</a>
            <a href="#portfolio" className="hover:text-white transition-colors">포트폴리오</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">로그인</Link>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-5" asChild>
              <Link to="/consultation">상담하기</Link>
            </Button>
          </div>
        </div>
      </header>

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
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            It works like a team.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            월 정액 구독으로 전문 디자이너 팀과 함께하세요
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base" asChild>
              <Link to="/consultation">시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base">
              더 알아보기
            </Button>
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
