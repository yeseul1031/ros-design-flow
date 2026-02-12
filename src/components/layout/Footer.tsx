import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg">주식회사 알오에스</h3>
            <p className="text-primary-foreground/80 text-sm mt-2">
              무제한 디자인 구독 서비스
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#packages" className="hover:text-primary-foreground transition-colors">패키지</a></li>
              <li><Link to="/ai-matching" className="hover:text-primary-foreground transition-colors">상담 신청</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">고객 지원</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="mailto:manager@rosdesigns.com" className="hover:text-primary-foreground transition-colors">manager@rosdesigns.com</a></li>
              <li><a href="tel:+821021665594" className="hover:text-primary-foreground transition-colors">010-2166-5594</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">회사 정보</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>상호명: 주식회사 알오에스</li>
              <li>사업자등록번호: 877-87-03752</li>
              <li>대표자명: 최인나</li>
              <li>주소: 서울시 중구 난계로 207</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} 주식회사 알오에스. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
