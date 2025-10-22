import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsultationForm } from "@/components/consultation/ConsultationForm";

const Consultation = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                무료 상담 신청
              </h1>
              <p className="text-lg text-muted-foreground">
                프로젝트에 대해 자세히 알려주세요. 24시간 내 연락드리겠습니다.
              </p>
            </div>
            
            <ConsultationForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Consultation;
