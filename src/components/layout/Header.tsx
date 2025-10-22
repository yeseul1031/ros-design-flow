import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="ROS Design" className="h-8" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/#packages" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-foreground hover:text-accent transition-colors"
            >
              패키지
            </Link>
            <Link to="/consultation" className="text-foreground hover:text-accent transition-colors">
              상담 신청
            </Link>
            <Link to="/auth" className="text-foreground hover:text-accent transition-colors">
              로그인
            </Link>
          </nav>
          
          <Button asChild>
            <Link to="/consultation">시작하기</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
