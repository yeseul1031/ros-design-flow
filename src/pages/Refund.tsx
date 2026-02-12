import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Refund = () => {
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
          취소/환불 정책
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 space-y-8">
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>1. 서비스 취소</h2>
              <p className="leading-relaxed">
                구독 서비스의 취소는 다음 결제일 전까지 언제든지 가능합니다.<br />
                취소 신청은 이메일(manager@rosdesigns.com) 또는 고객센터를 통해 접수할 수 있습니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>2. 환불 조건</h2>
              <p className="leading-relaxed">
                <strong className="text-white">서비스 시작 전:</strong> 전액 환불<br /><br />
                <strong className="text-white">서비스 시작 후:</strong><br />
                • 7일 이내: 이용료의 90% 환불<br />
                • 7일 초과 ~ 14일 이내: 이용료의 70% 환불<br />
                • 14일 초과: 환불 불가<br /><br />
                단, 디자인 작업이 이미 시작된 경우 해당 작업에 대한 비용은 환불 대상에서 제외됩니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>3. 환불 절차</h2>
              <p className="leading-relaxed">
                1. 환불 신청: 이메일 또는 고객센터를 통해 환불 신청<br />
                2. 환불 심사: 영업일 기준 3일 이내 심사 완료<br />
                3. 환불 처리: 심사 완료 후 영업일 기준 7일 이내 환불 처리<br /><br />
                환불은 원 결제 수단으로 진행되며, 결제 수단에 따라 환불 완료까지 추가 시간이 소요될 수 있습니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>4. 환불 제외 사항</h2>
              <p className="leading-relaxed">
                다음의 경우에는 환불이 제한될 수 있습니다.<br /><br />
                • 이용자의 귀책사유로 서비스 이용이 불가능한 경우<br />
                • 이미 완료된 디자인 작업물에 대한 환불 요청<br />
                • 서비스 약관을 위반한 경우<br />
                • 기타 회사의 정당한 환불 거부 사유가 있는 경우
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>5. 구독 일시정지</h2>
              <p className="leading-relaxed">
                구독 기간 중 일시정지가 필요한 경우, 월 1회에 한하여 최대 7일간 서비스 일시정지를 신청할 수 있습니다.<br />
                일시정지 기간은 구독 기간에서 제외되며, 일시정지 종료 후 남은 구독 기간이 자동으로 연장됩니다.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white mb-4" style={{ fontWeight: 500 }}>6. 문의</h2>
              <p className="leading-relaxed">
                취소 및 환불에 관한 문의사항이 있으시면 아래로 연락해 주세요.<br /><br />
                <strong className="text-white">이메일:</strong> manager@rosdesigns.com<br />
                <strong className="text-white">전화:</strong> 010-2166-5594<br />
                <strong className="text-white">운영시간:</strong> 평일 09:00 - 18:00 (주말/공휴일 휴무)
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

export default Refund;
