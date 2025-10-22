import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <img 
            src={logo} 
            alt="ROS Design" 
            className="h-16 md:h-20 object-contain mb-4"
          />
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
            무제한 디자인 구독
            <span className="block text-accent mt-2">당신의 브랜드를 완성하세요</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            월 정액제로 브랜드 디자인부터 웹/앱 개발까지, 
            전문 디자이너가 당신의 프로젝트를 책임집니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/consultation">
                무료 상담 신청하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="#packages">
                패키지 둘러보기
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-16 pt-8 border-t border-border">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">무제한</div>
              <div className="text-sm text-muted-foreground mt-2">디자인 요청</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">48시간</div>
              <div className="text-sm text-muted-foreground mt-2">평균 작업 시간</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent">100%</div>
              <div className="text-sm text-muted-foreground mt-2">만족 보장</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
