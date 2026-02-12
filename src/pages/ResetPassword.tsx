import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import logoSvg from "@/assets/logo.svg";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다").max(20, "비밀번호는 최대 20자까지 가능합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Listen for auth state changes - this catches the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
        setVerifying(false);
      }
    });

    const verifyToken = async () => {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (tokenHash && type === "recovery") {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        console.log("verifyOtp result:", { data, error });
        if (!error && data?.session) {
          setSessionReady(true);
        } else if (error) {
          console.error("Token verification failed:", error);
          // Check if we already have a session from onAuthStateChange
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setSessionReady(true);
          } else {
            toast({ title: "링크가 만료되었거나 유효하지 않습니다.", description: "비밀번호 찾기를 다시 시도해주세요.", variant: "destructive" });
          }
        }
      } else {
        // Check if already has a session (e.g. from hash fragment)
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSessionReady(true);
        } else {
          toast({ title: "유효하지 않은 접근입니다.", description: "비밀번호 찾기를 다시 시도해주세요.", variant: "destructive" });
        }
      }
      setVerifying(false);
    };
    verifyToken();

    return () => subscription.unsubscribe();
  }, [searchParams, toast]);

  const isFormValid = password.trim() !== "" && confirmPassword.trim() !== "";

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      resetPasswordSchema.parse({ password, confirmPassword });
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      navigate("/reset-password-complete");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "입력 오류", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "오류 발생", description: "비밀번호 변경 중 문제가 발생했습니다.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '-0.025em',
    color: '#FFFFFF',
  };

  return (
    <div className="min-h-screen text-white" style={{ background: '#111111' }}>
      {/* Header */}
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
            <Link to="/plan" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>PLAN</Link>
            <Link to="/consultation" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>AI MATCHING</Link>
            <div className="flex items-center">
              <Link to="/auth?tab=login" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>로그인</Link>
              <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
              <Link to="/auth?tab=signup" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>회원가입</Link>
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
          minHeight: '1080px',
          margin: '0 auto',
          paddingTop: '120px',
          paddingBottom: '120px',
          paddingLeft: '24px',
          paddingRight: '24px',
          gap: '48px',
        }}
      >
        <div style={{ width: '500px', maxWidth: '100%', gap: '48px' }} className="flex flex-col items-center">
          <h1 style={{ fontWeight: 600, fontSize: '32px', lineHeight: '42px', letterSpacing: '-0.025em', textAlign: 'center', color: '#FFFFFF' }}>
            비밀번호 재설정
          </h1>

          <form onSubmit={handleResetPassword} className="flex flex-col" style={{ width: '500px', maxWidth: '100%', gap: '24px' }}>
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <label style={labelStyle}>비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="새로운 비밀번호를 입력해 주세요 (8-20자)"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '48px' }}
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
              <input
                type="password"
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                className="placeholder:text-[#FFFFFF99]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              style={{
                width: '100%', height: '56px', borderRadius: '6px', padding: '16px',
                background: isFormValid ? '#EB4B29' : '#3D3D3D',
                border: 'none', fontWeight: 600, fontSize: '16px', lineHeight: '24px',
                letterSpacing: '-0.025em', textAlign: 'center' as const,
                color: isFormValid ? '#FFFFFF' : '#FFFFFF99',
                cursor: (isLoading || !isFormValid) ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1, transition: 'background 0.3s ease',
              }}
            >
              {isLoading ? "변경 중..." : "변경하기"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1A1A1A', borderTop: '1px solid #333333' }}>
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-white" style={{ fontWeight: 600, fontSize: '56px', lineHeight: '72px', letterSpacing: '0' }}>
              Everything you<br />need in one subscription.
            </h2>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#999999' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <span>•</span>
              <a href="https://pf.kakao.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kakao Talk</a>
              <span>•</span>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="text-sm mb-2" style={{ color: '#666666' }}><p>(주)알오에스 | 대표 최인나 |</p></div>
          <div className="text-sm mb-6" style={{ color: '#666666' }}><p>사업자등록번호 877-87-03752 | 경기 남양주시 별내3로 322 (별내동) 404 | 010-2166-5594 | manager@rosdesigns.com</p></div>
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

export default ResetPassword;
