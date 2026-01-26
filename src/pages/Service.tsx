import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, ArrowRight, ChevronRight, Play } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber } from "@/utils/phoneFormat";
import { Link } from "react-router-dom";

const Service = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    brand: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
    privacyAgreed: false,
  });

  const brandsRef = useRef<HTMLDivElement>(null);

  // Infinite scrolling brand animation
  useEffect(() => {
    const brands = brandsRef.current;
    if (!brands) return;
    
    let scrollAmount = 0;
    const scrollSpeed = 0.5;
    
    const animate = () => {
      scrollAmount += scrollSpeed;
      if (scrollAmount >= brands.scrollWidth / 2) {
        scrollAmount = 0;
      }
      brands.style.transform = `translateX(-${scrollAmount}px)`;
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload: any = {
        name: formData.contactName || "담당자 미기재",
        email: formData.email.trim(),
        phone: formData.phone,
        company: formData.brand || null,
        service_type: 'custom' as any,
        message: formData.message || '',
        status: 'new' as any,
        user_id: user?.id || null,
        attachments: [],
        privacy_agreed: formData.privacyAgreed,
        privacy_agreed_at: formData.privacyAgreed ? new Date().toISOString() : null,
      };

      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;

      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({ brand: "", contactName: "", email: "", phone: "", message: "", privacyAgreed: false });
    } catch (err: any) {
      console.error('Error submitting subscription inquiry:', err);
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // Brand logos for carousel
  const brandLogos = ["tvN", "삼스-네", "LG U+", "쿠팡", "삼스-네", "LG U+", "tvN", "롯데", "LG U+", "SK텔콤"];

  // Portfolio items for gallery
  const portfolioItems = [
    { id: 1, image: "/images/service/illustration.png", category: "Pr" },
    { id: 2, image: "/images/service/illustration.png", category: "" },
    { id: 3, image: "/images/service/illustration.png", category: "Bd" },
    { id: 4, image: "/images/service/illustration.png", category: "" },
    { id: 5, image: "/images/service/illustration.png", category: "" },
  ];

  // Team members
  const teamMembers = [
    { name: "서지디자이너", role: "시각디자인 / 그래픽디자인", image: "/images/service/designer.png" },
    { name: "디자이너 이름", role: "시각디자인 / 패키지디자인", image: "/images/service/designer.png" },
    { name: "이 디자이너", role: "디지털 / UX디자인", image: "/images/service/designer.png" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section - New Design */}
        <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
          {/* Background gradient/image effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-50">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0a0a0a]" />
          </div>
          
          <div className="container relative z-10 mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
              It works like a team.
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              바로 시작하고, 중간에 그만두고. 채용을 훨씬 뛰어넘는.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-base font-medium"
                asChild
              >
                <a href="#contact">문의하기</a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12 text-base font-medium"
                asChild
              >
                <Link to="/consultation">
                  포트폴리오 <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Red accent bar on right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-32 bg-red-500" />
        </section>

        {/* Brand Carousel */}
        <section className="py-8 bg-[#0a0a0a] overflow-hidden border-y border-white/10">
          <div className="relative">
            <div 
              ref={brandsRef}
              className="flex gap-16 items-center whitespace-nowrap"
              style={{ width: 'fit-content' }}
            >
              {[...brandLogos, ...brandLogos].map((brand, i) => (
                <span 
                  key={i}
                  className="text-white/40 text-lg font-medium tracking-wider"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 선 넘는 편의성 Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                선 넘는 편의성
              </h2>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {/* Large feature card */}
              <div className="md:col-span-2 rounded-2xl overflow-hidden relative bg-gradient-to-br from-[#1a2332] to-[#0f1419] p-8 min-h-[300px] flex flex-col justify-end">
                <div className="absolute top-4 right-4">
                  <span className="text-white/40 text-sm">●</span>
                </div>
                <div className="absolute top-8 right-8 w-48 h-32 bg-white/5 rounded-lg transform rotate-3" />
                <h3 className="text-2xl font-bold text-white mb-2">한 번의 도구, 모든 디자인</h3>
                <p className="text-white/60">처음부터 끝까지 모든 디자인 파일을 한 곳에서.</p>
              </div>
              
              {/* Small feature cards */}
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#1a2332] p-6 h-[142px] flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-lg">📱</span>
                  </div>
                  <p className="text-white/80 text-sm">언제 어디서든 실시간 소통</p>
                </div>
                <div className="rounded-2xl bg-[#1a2332] p-6 h-[142px] flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-lg">⚡</span>
                  </div>
                  <p className="text-white/80 text-sm">빠른 피드백과 수정</p>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="w-2 h-2 rounded-full bg-white/30"></span>
              <span className="w-2 h-2 rounded-full bg-white/30"></span>
            </div>
          </div>
        </section>

        {/* 좋은 Vibes, 좋은 Results Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden bg-[#1a2332] aspect-video">
                <img 
                  src="/images/service/partnership.png" 
                  alt="Results showcase" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-white/40 text-sm uppercase tracking-wider mb-4">Service Quality</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  좋은 Vibes,<br />좋은 Results
                </h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                  바이브레이터 프레임워크에서 영감을 받은<br />
                  고객 만족도 100%의 비결
                </p>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 rounded-full"
                  asChild
                >
                  <Link to="/consultation">
                    더 알아보기 <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 px-4 bg-[#0a0a0a] border-y border-white/10">
          <div className="container mx-auto max-w-6xl">
            <p className="text-white/40 text-sm uppercase tracking-wider mb-8">Proven Track Record</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
              숫자로 증명된 신뢰
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">30+</div>
                <p className="text-white/60 text-sm">협업 기업 수</p>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">52+</div>
                <p className="text-white/60 text-sm">완료 프로젝트</p>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">300+</div>
                <p className="text-white/60 text-sm">제작 디자인 수</p>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">25,600+</div>
                <p className="text-white/60 text-sm">총 구독 시간</p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Gallery - 브랜드에 맞는 디자인 */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                브랜드에 맞는 디자인
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {portfolioItems.map((item) => (
                <div 
                  key={item.id} 
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#1a2332] group cursor-pointer"
                >
                  <img 
                    src={item.image} 
                    alt={`Portfolio ${item.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.category && (
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
                      <span className="text-white text-xs">{item.category}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - 가격은 간단하게 */}
        <section className="py-20 md:py-32 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0a0a0a]">
                가격은 간단하게
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* 1개월 */}
              <Card className="p-8 bg-[#0a0a0a] border-0 rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-xs text-white/40 border border-white/20 rounded-full px-3 py-1">추천</span>
                </div>
                <div className="mb-8">
                  <img src="/images/service/illustration.png" alt="1개월" className="w-full h-32 object-contain opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1개월 구독</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">130</span>
                  <span className="text-white/60">만원</span>
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    전담 디자이너 배정
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    무제한 수정
                  </li>
                </ul>
              </Card>

              {/* 3개월 */}
              <Card className="p-8 bg-[#0a0a0a] border-2 border-red-500 rounded-3xl relative overflow-hidden scale-105 shadow-2xl shadow-red-500/20">
                <div className="absolute top-4 right-4">
                  <span className="text-xs text-red-400 bg-red-500/20 rounded-full px-3 py-1">BEST</span>
                </div>
                <div className="mb-8">
                  <img src="/images/service/illustration.png" alt="3개월" className="w-full h-32 object-contain" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">3개월 구독</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">300</span>
                  <span className="text-white/60">만원</span>
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    전담 디자이너 배정
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    무제한 수정
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    30만원 할인
                  </li>
                </ul>
              </Card>

              {/* 6개월 */}
              <Card className="p-8 bg-[#0a0a0a] border-0 rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-xs text-white/40 border border-white/20 rounded-full px-3 py-1">Pro</span>
                </div>
                <div className="mb-8">
                  <img src="/images/service/illustration.png" alt="6개월" className="w-full h-32 object-contain opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">6개월 구독</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">550</span>
                  <span className="text-white/60">만원</span>
                </div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    전담 디자이너 배정
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    무제한 수정
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    80만원 할인
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section - ROS와 함께한 팀 */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                ROS와 함께한 팀
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6 rounded-2xl overflow-hidden bg-[#1a2332] aspect-[4/5]">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    {index === 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="text-xs text-red-400 bg-red-500/20 rounded-full px-3 py-1">BEST</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-white/60">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0a0a0a]">
                자주 묻는 질문
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-gray-200 rounded-2xl px-6 bg-white">
                <AccordionTrigger className="text-left text-lg font-semibold text-[#0a0a0a] hover:no-underline py-6">
                  디자인 구독 서비스가 뭔가요?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  ROS 디자인 구독 서비스는 월 정액제로 전문 디자이너를 고용하는 것과 같은 효과를 누릴 수 있는 서비스입니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-gray-200 rounded-2xl px-6 bg-white">
                <AccordionTrigger className="text-left text-lg font-semibold text-[#0a0a0a] hover:no-underline py-6">
                  진행중 담당 디자이너 변경도 가능할까요?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  네, 가능합니다. 프로젝트 진행 중 디자이너와의 협업이 원활하지 않을 경우 변경이 가능합니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-gray-200 rounded-2xl px-6 bg-white">
                <AccordionTrigger className="text-left text-lg font-semibold text-[#0a0a0a] hover:no-underline py-6">
                  작업이 가능한 디자인 종류는 어떻게 되나요?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  웹/앱 디자인, 브랜드 디자인, 패키지 디자인, 상세페이지 등 다양한 디자인 작업이 가능합니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-gray-200 rounded-2xl px-6 bg-white">
                <AccordionTrigger className="text-left text-lg font-semibold text-[#0a0a0a] hover:no-underline py-6">
                  작업 가능한 근무시간은 어떻게 되나요?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  평일 오전 10시부터 오후 7시까지가 기본 근무시간입니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-gray-200 rounded-2xl px-6 bg-white">
                <AccordionTrigger className="text-left text-lg font-semibold text-[#0a0a0a] hover:no-underline py-6">
                  구독 중 취소가 가능한가요?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  구독 기간 중 취소는 어렵지만, 일시 중지(홀딩) 기능을 활용하실 수 있습니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Contact Form - 이제 시작할 차례 */}
        <section id="contact" className="py-20 md:py-32 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left side - CTA */}
              <div className="flex flex-col justify-center">
                <div className="bg-red-500 text-white p-8 rounded-3xl mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Contact
                  </h2>
                  <p className="text-white/80 leading-relaxed">
                    문의사항이 있으시면 언제든지 연락주세요.<br />
                    빠른 시일 내에 답변드리겠습니다.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <span>📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <a href="mailto:manager@rosdesigns.com" className="text-[#0a0a0a] font-medium hover:text-red-500 transition-colors">
                        manager@rosdesigns.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <span>📞</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">연락처</p>
                      <a href="tel:010-2166-5594" className="text-[#0a0a0a] font-medium hover:text-red-500 transition-colors">
                        010-2166-5594
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Form */}
              <Card className="p-8 md:p-10 bg-gray-50 border-0 rounded-3xl">
                <h3 className="text-2xl font-bold text-[#0a0a0a] mb-8">이제 시작할 차례</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-2 block">
                        브랜드명
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="회사명"
                        className="h-12 bg-white border-gray-200 text-[#0a0a0a] placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName" className="text-sm font-medium text-gray-700 mb-2 block">
                        담당자 이름
                      </Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="홍길동"
                        className="h-12 bg-white border-gray-200 text-[#0a0a0a] placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                        이메일
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@email.com"
                        className="h-12 bg-white border-gray-200 text-[#0a0a0a] placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                        연락처
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                        placeholder="000-0000-0000"
                        inputMode="numeric"
                        maxLength={13}
                        className="h-12 bg-white border-gray-200 text-[#0a0a0a] placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                      문의내용
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="문의하실 내용을 입력해주세요"
                      rows={4}
                      className="bg-white border-gray-200 text-[#0a0a0a] placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacyAgreed}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, privacyAgreed: checked === true })
                      }
                      className="mt-1"
                      required
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                      <span className="font-semibold text-[#0a0a0a]">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={!formData.privacyAgreed}
                    className="w-full h-14 text-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    문의 보내기
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-20 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Everything you<br />
              need in one subscription.
            </h2>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Service;
