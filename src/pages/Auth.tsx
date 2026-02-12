import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoSvg from "@/assets/logo.svg";
import { Eye, EyeOff } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      authSchema.parse({ email, password });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({ title: "로그인 실패", description: "이메일 또는 비밀번호가 올바르지 않습니다.", variant: "destructive" });
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "입력 오류", description: error.errors[0].message, variant: "destructive" });
      } else if (!(error as any)?.message?.includes("Invalid login")) {
        toast({ title: "오류 발생", description: "로그인 중 문제가 발생했습니다.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "이메일 전송 완료", description: "비밀번호 재설정 링크가 이메일로 전송되었습니다." });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch {
      toast({ title: "오류 발생", description: "이메일 전송 중 문제가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ background: '#111111' }}>
      {/* Header - same as Plan page */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-6">
        <nav
          className="w-full max-w-[1872px] h-16 flex items-center justify-between rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid transparent',
            borderImage: 'linear-gradient(135.77deg, rgba(255, 255, 255, 0.1) 13.6%, rgba(255, 255, 255, 0) 103.36%), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
            borderImageSlice: '1',
            boxShadow: 'inset 0px 0px 12px 0px rgba(255, 255, 255, 0.1)',
            padding: '20px 24px',
          }}
        >
          <Link to="/" className="flex-shrink-0">
            <img src={logoSvg} alt="ROS Logo" className="w-[63px] h-[21px]" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#team" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>TEAM</Link>
            <Link to="/plan" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>PLAN</Link>
            <Link to="/consultation" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>AI MATCHING</Link>
            <div className="flex items-center">
              <Link to="/auth" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>로그인</Link>
              <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
              <Link to="/auth" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>회원가입</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          maxWidth: '1920px',
          width: '100%',
          height: '1080px',
          margin: '0 auto',
          paddingTop: '120px',
          paddingBottom: '120px',
          paddingLeft: '24px',
          paddingRight: '24px',
          gap: '48px',
        }}
      >
        <div style={{ width: '500px', maxWidth: '100%', gap: '48px' }} className="flex flex-col items-center">
          {/* Title */}
          <h1
            style={{
              fontWeight: 600,
              fontSize: '32px',
              lineHeight: '42px',
              letterSpacing: '-0.025em',
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            로그인
          </h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col" style={{ width: '500px', maxWidth: '100%', gap: '24px' }}>
            {/* Email & Password fields */}
            <div className="flex flex-col" style={{ width: '500px', maxWidth: '100%', gap: '24px' }}>
              {/* Email */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '-0.025em',
                    color: '#FFFFFF',
                  }}
                >
                  이메일
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="hello@example.com"
                  required
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '24px',
                    letterSpacing: '-0.025em',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                  className="placeholder:text-[#FFFFFF99]"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label
                  style={{
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '-0.025em',
                    color: '#FFFFFF',
                  }}
                >
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '6px',
                      padding: '14px 48px 14px 16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'transparent',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '24px',
                      letterSpacing: '-0.025em',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                    className="placeholder:text-[#FFFFFF99]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFFFFF99] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '6px',
                padding: '16px',
                background: '#3D3D3D',
                border: 'none',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '-0.025em',
                textAlign: 'center',
                color: '#FFFFFF99',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>

            {/* Keep logged in & Forgot password */}
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-[#FFFFFF33] bg-transparent accent-white"
                  style={{ accentColor: '#FFFFFF' }}
                />
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '-0.025em',
                    color: '#FFFFFF99',
                  }}
                >
                  로그인 유지
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF99',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="hover:text-white transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="flex items-center justify-center" style={{ gap: '6px' }}>
            <span
              style={{
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '22px',
                letterSpacing: '-0.025em',
                color: '#FFFFFF99',
              }}
            >
              아직 회원이 아니신가요?
            </span>
            <Link
              to="/auth?tab=signup"
              style={{
                fontWeight: 600,
                fontSize: '15px',
                lineHeight: '22px',
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
              }}
              className="hover:opacity-80 transition-opacity"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="p-8 rounded-lg max-w-md w-full" style={{ background: '#222222', border: '1px solid #333333' }}>
            <h3 className="text-xl font-bold mb-4 text-white">비밀번호 찾기</h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label style={{ fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: '#FFFFFF' }}>이메일</label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    fontSize: '16px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                  className="placeholder:text-[#FFFFFF99]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setResetEmail(""); }}
                  className="flex-1 h-12 rounded-md border border-[#555] text-white hover:bg-[#333] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-md text-white transition-colors"
                  style={{ background: '#3D3D3D' }}
                >
                  {isLoading ? "전송 중..." : "재설정 링크 전송"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer - same as Plan page */}
      <footer style={{ background: '#1A1A1A', borderTop: '1px solid #333333' }}>
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-8">
            <h2
              className="text-white"
              style={{ fontWeight: 600, fontSize: '56px', lineHeight: '72px', letterSpacing: '0' }}
            >
              Everything you<br />
              need in one subscription.
            </h2>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#999999' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <span>•</span>
              <a href="https://pf.kakao.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kakao Talk</a>
              <span>•</span>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="text-sm mb-2" style={{ color: '#666666' }}>
            <p>(주)알오에스 | 대표 최인나 |</p>
          </div>
          <div className="text-sm mb-6" style={{ color: '#666666' }}>
            <p>사업자등록번호 877-87-03752 | 경기 남양주시 별내3로 322 (별내동) 404 | 010-2166-5594 | manager@rosdesigns.com</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: '#666666' }}>©ROS. All rights reserved.</p>
            <div className="flex items-center gap-8 text-sm" style={{ color: '#999999' }}>
              <a href="/terms" className="hover:text-white transition-colors">이용약관</a>
              <a href="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</a>
              <a href="/refund" className="hover:text-white transition-colors">취소/환불 정책</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
