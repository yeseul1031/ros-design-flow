import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Service = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    brand: "",
    email: "",
    phone: "",
    message: "",
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
        name: formData.brand || "담당자 미기재",
        email: formData.email,
        phone: formData.phone,
        company: formData.brand || null,
        service_type: 'custom' as any,
        message: formData.message || '',
        status: 'new' as any,
        user_id: user?.id || null,
        attachments: [],
      };

      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;

      toast({
        title: "문의가 접수되었습니다",
        description: "빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({ brand: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      console.error('Error submitting subscription inquiry:', err);
      toast({
        title: "오류 발생",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const portfolioItems = [
    { id: 1, image: "/images/service/illustration.png" },
    { id: 2, image: "/images/service/illustration.png" },
    { id: 3, image: "/images/service/illustration.png" },
    { id: 4, image: "/images/service/illustration.png" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-[#0a0a0a] py-20 md:py-32 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-16 leading-tight">
              채용보다 빠르고<br />
              외주보다 효율적인<br />
              디자이너
            </h1>
            
            <div className="relative max-w-4xl mx-auto">
              <img 
                src="/images/service/hero-1.png" 
                alt="Hero illustration" 
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Brand Carousel */}
        <section className="py-12 bg-[#0a0a0a] overflow-hidden">
          <div className="relative">
            <div 
              ref={brandsRef}
              className="flex gap-12 items-center whitespace-nowrap"
              style={{ width: 'fit-content' }}
            >
              {[...Array(8)].map((_, i) => (
                <img 
                  key={i}
                  src="/images/service/illustration.png" 
                  alt="Brand logo" 
                  className="h-12 opacity-40"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/service/icon.png" 
                  alt="WHY icon" 
                  className="w-8 h-8"
                />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-2">
                왜 디자이너 구독이 필요한가요?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Left Card - Light Blue */}
              <Card className="p-8 md:p-10 bg-[#7ab8e8] border-0 rounded-3xl">
                <h3 className="text-2xl md:text-3xl font-bold text-[#1a2332] mb-6">
                  정찰제 구독 비용
                </h3>
                <p className="text-[#1a2332]/80 mb-8 leading-relaxed">
                  복잡한 비용 조율X<br />
                  추가 지출없이 비용 걱정없이 구독하세요.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#a8d4f0] rounded-2xl px-6 py-4">
                    <div className="w-6 h-6 rounded-full bg-[#1a2332] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#1a2332] font-semibold">월 100만원</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#a8d4f0] rounded-2xl px-6 py-4">
                    <div className="w-6 h-6 rounded-full bg-[#1a2332] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#1a2332] font-semibold">추가 비용 X</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#a8d4f0] rounded-2xl px-6 py-4">
                    <div className="w-6 h-6 rounded-full bg-[#1a2332] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#1a2332] font-semibold">고용 보험 X</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#a8d4f0] rounded-2xl px-6 py-4">
                    <div className="w-6 h-6 rounded-full bg-[#1a2332] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#1a2332] font-semibold">일반 직원 1/3 가격</span>
                  </div>
                </div>
              </Card>

              {/* Right Card - Dark */}
              <Card className="p-8 md:p-10 bg-[#1a2332] border-0 rounded-3xl">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  유연한 고용 방식
                </h3>
                <p className="text-white/70 mb-8 leading-relaxed">
                  프리랜서? 정직원? 헷갈리는 고용방식<br />
                  ROS는 단순하고 유연합니다.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">최소 1개월 구독 가능</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">무제한 수정 및 디자인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">담당 디자이너 배정</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-medium">실시간 업무 소통</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Partnership Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/service/badge.png" 
                  alt="Badge" 
                  className="h-6"
                />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                채용 없이도,<br />
                필요한 순간 바로 연결되는<br />
                디자인 파트너십
              </h2>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <img 
                src="/images/service/partnership.png" 
                alt="Partnership" 
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Portfolio Carousel */}
        <section className="py-12 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {portfolioItems.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-80 snap-start">
                  <Card className="bg-[#1a2332] border-0 rounded-2xl overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={`Portfolio ${item.id}`}
                      className="w-full h-48 object-cover"
                    />
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/service/icon.png" 
                  alt="Section icon" 
                  className="w-8 h-8"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                경력 5년 이상의 디자이너들을
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white">
                최소 1개월 부터 구독 가능합니다!
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
              <Card className="p-8 bg-[#1a2332] border-2 border-white/10 rounded-3xl text-center hover:border-white/30 transition-colors">
                <h4 className="text-lg font-semibold text-white/70 mb-6">1개월 구독</h4>
                <div className="mb-4">
                  <span className="text-7xl font-bold text-white">130</span>
                  <span className="text-2xl text-white/70 ml-2">만원</span>
                </div>
              </Card>

              <Card className="p-8 bg-[#1a2332] border-2 border-[#7ab8e8] rounded-3xl text-center scale-105 shadow-2xl shadow-[#7ab8e8]/20">
                <h4 className="text-lg font-semibold text-[#7ab8e8] mb-6">3개월 구독</h4>
                <div className="mb-4">
                  <span className="text-7xl font-bold text-white">300</span>
                  <span className="text-2xl text-white/70 ml-2">만원</span>
                </div>
              </Card>

              <Card className="p-8 bg-[#1a2332] border-2 border-white/10 rounded-3xl text-center hover:border-white/30 transition-colors">
                <h4 className="text-lg font-semibold text-white/70 mb-6">6개월 구독</h4>
                <div className="mb-4">
                  <span className="text-7xl font-bold text-white">550</span>
                  <span className="text-2xl text-white/70 ml-2">만원</span>
                </div>
              </Card>
            </div>

            <p className="text-center text-white/50 text-sm">( 부가세 10% 별도 )</p>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/service/icon.png" 
                  alt="Section icon" 
                  className="w-8 h-8"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                구독은 이렇게 진행돼요!
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a2332] flex items-center justify-center mx-auto mb-6">
                  <img src="/images/service/icon.png" alt="Step icon" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">01</h3>
                <h4 className="text-xl font-semibold text-white mb-2">구독 신청</h4>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a2332] flex items-center justify-center mx-auto mb-6">
                  <img src="/images/service/icon.png" alt="Step icon" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">02</h3>
                <h4 className="text-xl font-semibold text-white mb-2">서류 전달</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  사업자등록증과 세금계산서를<br />받아볼 이메일 주소 입력
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a2332] flex items-center justify-center mx-auto mb-6">
                  <img src="/images/service/icon.png" alt="Step icon" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">03</h3>
                <h4 className="text-xl font-semibold text-white mb-2">계약 진행</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  계약서와 세금계산서 발급 확인<br />ROS에 계약금 선입금
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a2332] flex items-center justify-center mx-auto mb-6">
                  <img src="/images/service/icon.png" alt="Step icon" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">04</h3>
                <h4 className="text-xl font-semibold text-white mb-2">구독 시작</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  입금 확인 후 오전 10시부터<br />메신저 초대 및 업무 시작
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Designer Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex mb-6">
                  <img 
                    src="/images/service/icon.png" 
                    alt="Section icon" 
                    className="w-8 h-8"
                  />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  경력직 디자이너와<br />협업하세요.
                </h2>
                <p className="text-xl text-white/70">
                  상담을 통해 더 많은 포트폴리오 자료 공유가 가능합니다-!
                </p>
              </div>
              
              <div className="relative">
                <img 
                  src="/images/service/designer.png" 
                  alt="Designer" 
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/service/icon.png" 
                  alt="Section icon" 
                  className="w-8 h-8"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                자주 묻는 질문
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-white/10 rounded-2xl px-6 bg-[#1a2332]">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline py-6">
                  디자인 구독 서비스가 뭔가요?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-6">
                  ROS 디자인 구독 서비스는 월 정액제로 전문 디자이너를 고용하는 것과 같은 효과를 누릴 수 있는 서비스입니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-white/10 rounded-2xl px-6 bg-[#1a2332]">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline py-6">
                  진행중 담당 디자이너 변경도 가능할까요?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-6">
                  네, 가능합니다. 프로젝트 진행 중 디자이너와의 협업이 원활하지 않을 경우 변경이 가능합니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-white/10 rounded-2xl px-6 bg-[#1a2332]">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline py-6">
                  작업이 가능한 디자인 종류는 어떻게 되나요?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-6">
                  웹/앱 디자인, 브랜드 디자인, 패키지 디자인, 상세페이지 등 다양한 디자인 작업이 가능합니다.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-white/10 rounded-2xl px-6 bg-[#1a2332]">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline py-6">
                  작업 가능한 근무시간은 어떻게 되나요?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-6">
                  평일 오전 10시부터 오후 7시까지가 기본 근무시간입니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 md:py-32 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/service/icon.png" 
                  alt="Section icon" 
                  className="w-8 h-8"
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                구독 문의 하기
              </h2>
            </div>

            <Card className="p-8 md:p-12 bg-[#1a2332] border-0 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="brand" className="text-base font-medium text-white mb-2 block">
                    브랜드명 (성함)
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="회사명 또는 성함"
                    className="h-12 bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium text-white mb-2 block">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="h-12 bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-medium text-white mb-2 block">
                    연락처
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="000-0000-0000"
                    className="h-12 bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/30"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-base font-medium text-white mb-2 block">
                    문의내용
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="문의하실 내용을 입력해주세요"
                    rows={6}
                    className="bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg bg-white hover:bg-white/90 text-black font-semibold rounded-xl"
                >
                  문의 보내기
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/10 text-center space-y-2">
                <p className="text-white/70">
                  <a href="tel:010-2166-5594" className="hover:text-white transition-colors">
                    (010) 2166-5594
                  </a>
                </p>
                <p className="text-white/70">
                  <a href="mailto:innachoi.ros@gmail.com" className="hover:text-white transition-colors">
                    innachoi.ros@gmail.com
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Service;
