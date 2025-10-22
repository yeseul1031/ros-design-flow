import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="ROS Design" className="h-8 mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/80 text-sm">
              무제한 디자인 구독 서비스
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#packages" className="hover:text-primary-foreground transition-colors">패키지</a></li>
              <li><Link to="/consultation" className="hover:text-primary-foreground transition-colors">상담 신청</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">고객 지원</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="mailto:hello@rosdesigns.com" className="hover:text-primary-foreground transition-colors">hello@rosdesigns.com</a></li>
              <li><a href="tel:+821012345678" className="hover:text-primary-foreground transition-colors">010-1234-5678</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">회사 정보</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>사업자등록번호: 123-45-67890</li>
              <li>대표: 홍길동</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} ROS Design. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
