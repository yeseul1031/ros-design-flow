import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Service = () => {
  const features = [
    {
      icon: Zap,
      title: "빠른 매칭",
      description: "AI 기반 자동 매칭으로 최적의 디자이너를 즉시 찾아드립니다."
    },
    {
      icon: Users,
      title: "전문 디자이너",
      description: "검증된 전문 디자이너들이 고품질 작업을 제공합니다."
    },
    {
      icon: Clock,
      title: "신속한 작업",
      description: "프로젝트 일정에 맞춰 빠르고 정확하게 작업을 완료합니다."
    },
  ];

  const benefits = [
    "무제한 디자인 수정 요청",
    "24시간 내 초안 제공",
    "저작권 100% 보장",
    "전담 프로젝트 매니저 배정",
    "월 단위 유연한 구독제",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#3b4a8c] via-[#2d3a70] to-[#1e2a5a] py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              무제한 디자인 구독서비스
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              필요할 때마다 전문 디자이너의 작업을 무제한으로 받아보세요.<br />
              복잡한 계약 없이 간편하게 시작하세요.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/consultation">무료 상담 신청</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">왜 ROS Design인가요?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">서비스 혜택</h2>
            <div className="max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">지금 바로 시작하세요</h2>
            <p className="text-lg text-muted-foreground mb-8">
              무료 상담으로 프로젝트에 대해 이야기해보세요.
            </p>
            <Button asChild size="lg">
              <Link to="/consultation">상담 신청하기</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Service;
