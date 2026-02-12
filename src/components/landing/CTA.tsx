import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary to-accent">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            무료 상담을 통해 프로젝트에 맞는 최적의 솔루션을 제안해드립니다.
            <br />
            빠르고 정확한 견적으로 프로젝트를 시작할 수 있습니다.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/ai-matching">
              무료 상담 신청하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
