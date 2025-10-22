import { Palette, Zap, Shield, Users } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "전문 디자이너 배정",
    description: "경력 5년 이상의 전문 디자이너가 당신의 브랜드를 책임집니다."
  },
  {
    icon: Zap,
    title: "빠른 작업 속도",
    description: "평균 48시간 내 초안 제공, 무제한 수정으로 완벽한 결과물을 보장합니다."
  },
  {
    icon: Shield,
    title: "프로젝트 홀딩",
    description: "바쁜 일정? 최대 14일씩 2회까지 프로젝트를 일시 정지할 수 있습니다."
  },
  {
    icon: Users,
    title: "전담 매니저 지원",
    description: "프로젝트 전 과정에서 전담 매니저가 커뮤니케이션을 지원합니다."
  }
];

export const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            왜 ROS Design인가요?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            효율적이고 전문적인 디자인 서비스로 브랜드의 가치를 높여드립니다.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card p-8 rounded-lg border border-border hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
