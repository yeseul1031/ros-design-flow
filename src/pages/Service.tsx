import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Service = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0a0f24] via-[#0d1328] to-[#1a1f3a] py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <p className="text-primary/80 text-sm font-medium mb-4 tracking-wider">월 100만원 디자인 구독서비스</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              채용보다 빠르고<br />
              외주보다 효율적인<br />
              디자이너
            </h1>
            <div className="flex justify-center gap-4 mt-8">
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
                <Link to="#pricing">구독 요금제 보기</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
                <Link to="/consultation">문의 하기</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-primary font-semibold mb-3">WHY</p>
              <h2 className="text-4xl font-bold mb-4">왜 디자이너 구독이 필요한가요?</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <Card className="p-8 bg-gradient-to-br from-background to-muted/30">
                <CardHeader>
                  <CardTitle className="text-2xl mb-4">정찰제 구독 비용</CardTitle>
                  <p className="text-muted-foreground mb-6">복잡한 비용 조율 없이<br />추가 지출없이 비용 걱정없이 구독하세요.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">월 100만원</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>추가 비용 X</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>고용 보험 X</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>일반 직원 1/3 가격</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-background to-muted/30">
                <CardHeader>
                  <CardTitle className="text-2xl mb-4">유연한 고용 방식</CardTitle>
                  <p className="text-muted-foreground mb-6">프리랜서? 정직원? 헷갈리는 고용방식<br />ROS는 단순하고 유연합니다.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>최소 1개월 구독 가능</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>무제한 수정 및 디자인</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>담당 디자이너 배정</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>실시간 업무 소통</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                채용 없이도, 필요한 순간 바로 연결되는<br />디자인 파트너십
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">채용 비용없이 월 100만원에</h3>
                    <h4 className="text-xl font-semibold mb-3">디자이너 구독하세요.</h4>
                    <p className="text-muted-foreground">
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
                    <h3 className="text-2xl font-bold mb-2">직원 관리 부담</h3>
                    <h4 className="text-xl font-semibold mb-3">이직 리스크 부담이 사라집니다!</h4>
                    <p className="text-muted-foreground">
                      더 이상 디자이너 관리에 시간을 낭비하지 마세요.<br />
                      필요한 만큼만 구독하고, 언제든 조정 가능합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              무료 상담으로 프로젝트에 대해 이야기해보세요.<br />
              최적의 디자이너 매칭을 도와드립니다.
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/consultation">무료 상담 신청하기</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Service;
