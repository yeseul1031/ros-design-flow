import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const packages = [
  {
    name: "브랜드 패키지",
    price: "₩1,500,000",
    period: "/월",
    description: "브랜드 아이덴티티 구축을 위한 필수 패키지",
    features: [
      "로고 디자인 및 브랜드 가이드",
      "명함, 봉투 등 인쇄물 디자인",
      "SNS 템플릿 디자인",
      "무제한 수정",
      "48시간 평균 작업 시간",
      "전담 디자이너 배정"
    ],
    highlighted: false
  },
  {
    name: "웹 디자인 패키지",
    price: "₩2,500,000",
    period: "/월",
    description: "웹사이트 및 랜딩페이지 전문 패키지",
    features: [
      "반응형 웹 디자인",
      "UX/UI 최적화",
      "프로토타입 제작",
      "개발 가이드 제공",
      "무제한 수정",
      "전담 디자이너 + 매니저",
      "프로젝트 홀딩 가능"
    ],
    highlighted: true
  },
  {
    name: "올인원 패키지",
    price: "₩3,500,000",
    period: "/월",
    description: "브랜드부터 웹/앱까지 모든 디자인 솔루션",
    features: [
      "브랜드 + 웹 패키지 모두 포함",
      "앱 UI/UX 디자인",
      "마케팅 콘텐츠 디자인",
      "영상 편집 및 모션 그래픽",
      "무제한 수정",
      "우선 작업 처리",
      "전담 디자이너 팀 + 매니저",
      "프로젝트 홀딩 2회"
    ],
    highlighted: false
  }
];

export const Packages = () => {
  return (
    <section id="packages" className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            맞춤형 구독 패키지
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            프로젝트 규모에 맞는 최적의 패키지를 선택하세요.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className={`relative bg-card rounded-2xl border-2 p-8 ${
                pkg.highlighted 
                  ? 'border-accent shadow-xl scale-105' 
                  : 'border-border'
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  인기
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {pkg.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {pkg.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">{pkg.price}</span>
                  <span className="text-muted-foreground ml-1">{pkg.period}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-card-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={pkg.highlighted ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link to="/consultation">
                  상담 신청하기
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
