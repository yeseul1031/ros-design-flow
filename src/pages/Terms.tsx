import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen" style={{ background: '#111111' }}>
      <div className="max-w-[1260px] mx-auto px-6 py-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>홈으로 돌아가기</span>
        </Link>
        
        <h1 
          className="text-4xl md:text-5xl text-white mb-12"
          style={{ 
            fontFamily: 'Pretendard',
            fontWeight: 400,
            letterSpacing: '-0.02em'
          }}
        >
          이용약관
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-8" style={{ fontFamily: 'Pretendard' }}>
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>제1조 (목적)</h2>
              <p className="leading-relaxed">
                이 약관은 주식회사 알오에스(이하 "회사")가 제공하는 디자인 구독 서비스(이하 "서비스")의 이용조건 및 절차, 
                회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>제2조 (정의)</h2>
              <p className="leading-relaxed">
                1. "서비스"란 회사가 제공하는 디자인 구독 서비스 일체를 의미합니다.<br />
                2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 고객을 말합니다.<br />
                3. "구독"이란 이용자가 정해진 기간 동안 서비스를 이용할 수 있는 권리를 말합니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>제3조 (약관의 효력 및 변경)</h2>
              <p className="leading-relaxed">
                1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.<br />
                2. 회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.<br />
                3. 약관이 변경되는 경우 회사는 변경사항을 서비스 내 공지사항을 통해 공지합니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>제4조 (서비스의 제공)</h2>
              <p className="leading-relaxed">
                1. 회사는 이용자에게 디자인 구독 서비스를 제공합니다.<br />
                2. 서비스의 구체적인 내용은 회사의 서비스 페이지에서 확인할 수 있습니다.<br />
                3. 회사는 서비스의 품질 향상을 위해 서비스 내용을 변경할 수 있습니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>제5조 (이용자의 의무)</h2>
              <p className="leading-relaxed">
                1. 이용자는 서비스 이용 시 관련 법령과 본 약관을 준수해야 합니다.<br />
                2. 이용자는 타인의 권리를 침해하거나 회사의 서비스 운영을 방해하는 행위를 해서는 안 됩니다.<br />
                3. 이용자는 서비스를 통해 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용할 수 없습니다.
              </p>
            </section>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            시행일자: 2024년 1월 1일<br />
            문의: manager@rosdesigns.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
