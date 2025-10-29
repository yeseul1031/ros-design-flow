import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
      });
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link to="/service" className="text-foreground hover:text-accent transition-colors">
              서비스안내
            </Link>
            <Link to="/consultation" className="text-foreground hover:text-accent transition-colors">
              디자이너 매칭
            </Link>
            {isLoggedIn && (
              <Link to="/dashboard" className="text-foreground hover:text-accent transition-colors">
                My Page
              </Link>
            )}
          </nav>
      
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Button variant="outline" onClick={handleLogout}>
                로그아웃
              </Button>
            ) : (
              <>
                <Link to="/auth" className="text-foreground hover:text-accent transition-colors">
                  로그인
                </Link>
                <Button asChild>
                  <Link to="/auth">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
