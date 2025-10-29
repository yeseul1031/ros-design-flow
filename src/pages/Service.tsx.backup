import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Zap, Users, Clock, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Service = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "문의가 접수되었습니다",
      description: "빠른 시일 내에 연락드리겠습니다.",
    });
    setFormData({ name: "", company: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-[#0a0f1f] via-[#0d1328] to-[#0a0f1f] py-24 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <p className="text-primary text-sm font-medium mb-4 tracking-wider uppercase">
              월 100만원 디자인 구독서비스
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              채용보다 빠르고<br />
              외주보다 효율적인<br />
              디자이너
            </h1>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
                <a href="#pricing">구독 요금제 보기</a>
              </Button>
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
                <a href="#contact">문의 하기</a>
              </Button>
            </div>

            {/* Logo Showcase */}
            <div className="mt-20 opacity-40">
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                <span className="text-white/60 text-sm">PHILIPS</span>
                <span className="text-white/60 text-sm">Google</span>
                <span className="text-white/60 text-sm">FESTOOL</span>
                <span className="text-white/60 text-sm">everybot.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-16 md:py-24 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">WHY</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 디자이너 구독이 필요한가요?</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6 md:p-8 bg-card border-border">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl md:text-2xl mb-3">정찰제 구독 비용</CardTitle>
                  <p className="text-muted-foreground text-sm md:text-base">
                    복잡한 비용 조율X<br />추가 지출없이 비용 걱정없이 구독하세요.
                  </p>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-semibold">월 100만원</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>추가 비용 X</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>고용 보험 X</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>일반 직원 1/3 가격</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 md:p-8 bg-card border-border">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl md:text-2xl mb-3">유연한 고용 방식</CardTitle>
                  <p className="text-muted-foreground text-sm md:text-base">
                    프리랜서? 정직원? 헷갈리는 고용방식<br />ROS는 단순하고 유연합니다.
                  </p>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>최소 1개월 구독 가능</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>무제한 수정 및 디자인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>담당 디자이너 배정</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>실시간 업무 소통</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                채용 없이도, 필요한 순간 바로 연결되는<br className="hidden md:block" />
                디자인 파트너십
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">채용 비용없이 월 100만원에</h3>
                    <h4 className="text-lg md:text-xl font-semibold mb-3">디자이너 구독하세요.</h4>
                    <p className="text-muted-foreground text-sm md:text-base">
                      급여, 인사관리, 세무처리 이제 모두 잊으셔도 됩니다.<br />
                      구독 하나로, 디자이너 협업을 간편하게 시작하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">직원 관리 부담</h3>
                    <h4 className="text-lg md:text-xl font-semibold mb-3">이직 리스크 부담이 사라집니다!</h4>
                    <p className="text-muted-foreground text-sm md:text-base">
                      잦은 퇴사로 인한 새로운 디자이너 영입,<br />
                      반복되는 채용과 관리에 지치셨다면<br />
                      디자이너 구독으로 해결하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">짧고 유동적인 일정으로</h3>
                    <h4 className="text-lg md:text-xl font-semibold mb-3">디자이너 채용이 망설여지셨죠?</h4>
                    <p className="text-muted-foreground text-sm md:text-base">
                      예상치 못한 변수, 번번한 일정 변경,<br />
                      짧은 프로젝트 기간! ROS 디자인 구독 서비스는<br />
                      이런 유동성에 완벽하게 대응합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">패키지부터 웹까지, 필요한데</h3>
                    <h4 className="text-lg md:text-xl font-semibold mb-3">예산은 한정적? 구독 하나면 끝!</h4>
                    <p className="text-muted-foreground text-sm md:text-base">
                      비용은 한정적인데 디자인 업무는 다양하죠?<br />
                      웹사이트, 패키지, 상세페이지까지<br />
                      인력을 유동적으로 매칭해드릴 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="py-16 md:py-24 px-4 bg-background">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">구독 문의하기</h2>
              <p className="text-muted-foreground text-sm md:text-base">
                문의 남겨주시면 빠른 시일 내에 연락드리겠습니다.
              </p>
            </div>

            <Card className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="홍길동"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">회사명</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="주식회사 ROS"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="hello@example.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010-1234-5678"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">문의 내용</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="문의하실 내용을 자유롭게 작성해주세요."
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  문의 보내기
                </Button>
              </form>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section id="pricing" className="py-16 md:py-24 px-4 bg-gradient-to-br from-primary via-primary to-accent">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10">
              무료 상담으로 프로젝트에 대해 이야기해보세요.<br />
              최적의 디자이너 매칭을 도와드립니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/consultation">무료 상담 신청하기</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-lg px-8">
                <a href="#contact">구독 문의하기</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Service;
