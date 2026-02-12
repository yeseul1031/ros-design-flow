import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
            
            fontWeight: 400,
            letterSpacing: '-0.02em'
          }}
        >
          개인정보 처리방침
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-8">
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>1. 개인정보 수집 항목</h2>
              <p className="leading-relaxed">
                주식회사 알오에스(이하 "회사")는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.<br /><br />
                <strong className="text-white">필수 수집 항목:</strong> 이름, 이메일, 연락처, 회사/단체명<br />
                <strong className="text-white">선택 수집 항목:</strong> 문의내용, 첨부파일
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>2. 개인정보 수집 및 이용 목적</h2>
              <p className="leading-relaxed">
                회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.<br /><br />
                • 서비스 제공 및 상담<br />
                • 계약 이행 및 서비스 제공에 따른 요금정산<br />
                • 회원 관리 및 본인 확인<br />
                • 마케팅 및 광고에 활용 (동의한 경우에 한함)
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>3. 개인정보 보유 및 이용 기간</h2>
              <p className="leading-relaxed">
                회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 
                단, 관계법령에 따라 보존할 필요가 있는 경우 회사는 해당 법령에서 정한 기간 동안 개인정보를 보관합니다.<br /><br />
                • 계약 또는 청약철회 등에 관한 기록: 5년<br />
                • 대금결제 및 재화 등의 공급에 관한 기록: 5년<br />
                • 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>4. 개인정보의 제3자 제공</h2>
              <p className="leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                다만, 아래의 경우에는 예외로 합니다.<br /><br />
                • 이용자가 사전에 동의한 경우<br />
                • 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>5. 개인정보 처리의 위탁</h2>
              <p className="leading-relaxed">
                회사는 서비스 향상을 위해서 아래와 같이 개인정보를 위탁하고 있습니다.<br /><br />
                • 결제 처리: 토스페이먼츠<br />
                • 이메일 발송: 서비스 제공 업체
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>6. 정보주체의 권리·의무</h2>
              <p className="leading-relaxed">
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.<br /><br />
                • 개인정보 열람 요구<br />
                • 오류 등이 있을 경우 정정 요구<br />
                • 삭제 요구<br />
                • 처리정지 요구
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>7. 개인정보 보호책임자</h2>
              <p className="leading-relaxed">
                <strong className="text-white">개인정보 보호책임자:</strong> 최인나<br />
                <strong className="text-white">이메일:</strong> manager@rosdesigns.com<br />
                <strong className="text-white">전화:</strong> 010-2166-5594
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

export default Privacy;
