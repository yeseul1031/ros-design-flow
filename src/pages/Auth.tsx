import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoSvg from "@/assets/logo.svg";
import { Eye, EyeOff } from "lucide-react";
import { formatPhoneNumber } from "@/utils/phoneFormat";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

const signupSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  company: z.string().optional(),
  name: z.string().min(2, "이름을 2자 이상 입력해주세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다").max(20, "비밀번호는 최대 20자까지 가능합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  // Form field states for validation
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupCompany, setSignupCompany] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const isLoginFormValid = loginEmail.trim() !== "" && loginPassword.trim() !== "";
  const isSignupFormValid = signupEmail.trim() !== "" && signupName.trim() !== "" && signupPassword.trim() !== "" && signupConfirmPassword.trim() !== "" && privacyAgreed;

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') setMode('signup');
    else if (tab === 'login') setMode('login');
  }, [searchParams]);

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
      loginSchema.parse({ email, password });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({ title: "로그인 실패", description: "이메일 또는 비밀번호가 올바르지 않습니다.", variant: "destructive" });
        } else { throw error; }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "입력 오류", description: error.errors[0].message, variant: "destructive" });
      } else if (!(error as any)?.message?.includes("Invalid login")) {
        toast({ title: "오류 발생", description: "로그인 중 문제가 발생했습니다.", variant: "destructive" });
      }
    } finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!privacyAgreed) {
      toast({ title: "동의 필요", description: "개인정보 수집·이용에 동의해주세요.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      signupSchema.parse({ email, company, name, password, confirmPassword });
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name, company },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "회원가입 실패", description: "이미 등록된 이메일입니다.", variant: "destructive" });
        } else { throw error; }
      } else {
        toast({ title: "회원가입 성공", description: "자동 로그인되었습니다." });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "입력 오류", description: error.errors[0].message, variant: "destructive" });
      } else if (!(error as any)?.message?.includes("already registered")) {
        toast({ title: "오류 발생", description: "회원가입 중 문제가 발생했습니다.", variant: "destructive" });
      }
    } finally { setIsLoading(false); }
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
    } finally { setIsLoading(false); }
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
            <Link to="/ai-matching" className="text-white hover:opacity-80 transition-opacity" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>AI MATCHING</Link>
            <div className="flex items-center">
            <button onClick={() => setMode('login')} className="text-white hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>로그인</button>
              <span className="text-white mx-2" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>/</span>
              <button onClick={() => setMode('signup')} className="text-white hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer" style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>회원가입</button>
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
        {mode === 'login' ? (
          /* ===== LOGIN ===== */
          <div style={{ width: '500px', maxWidth: '100%', gap: '48px' }} className="flex flex-col items-center">
            <h1 style={{ fontWeight: 600, fontSize: '32px', lineHeight: '42px', letterSpacing: '-0.025em', textAlign: 'center', color: '#FFFFFF' }}>
              로그인
            </h1>

            <form onSubmit={handleLogin} className="flex flex-col" style={{ width: '500px', maxWidth: '100%', gap: '24px' }}>
              <div className="flex flex-col" style={{ gap: '24px' }}>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  <label style={labelStyle}>이메일</label>
                  <input name="email" type="email" placeholder="이메일을 입력해 주세요" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={inputStyle} className="placeholder:text-[#FFFFFF99]" />
                </div>
                <div className="flex flex-col" style={{ gap: '8px' }}>
                  <label style={labelStyle}>비밀번호</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '48px' }} className="placeholder:text-[#FFFFFF99]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFFFFF99] hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading || !isLoginFormValid} style={{ width: '100%', height: '56px', borderRadius: '6px', padding: '16px', background: isLoginFormValid ? '#EB4B29' : '#3D3D3D', border: 'none', fontWeight: 600, fontSize: '16px', lineHeight: '24px', letterSpacing: '-0.025em', textAlign: 'center' as const, color: isLoginFormValid ? '#FFFFFF' : '#FFFFFF99', cursor: (isLoading || !isLoginFormValid) ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, transition: 'background 0.3s ease' }}>
                {isLoading ? "로그인 중..." : "로그인"}
              </button>

              {/* Keep logged in & Forgot password - tighter gap */}
              <div className="flex items-center justify-between" style={{ width: '100%', marginTop: '-8px' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      width: '16px', height: '16px', borderRadius: '3px',
                      border: keepLoggedIn ? 'none' : '1px solid rgba(255,255,255,0.3)',
                      background: keepLoggedIn ? '#EB4B29' : 'transparent',
                    }}
                  >
                    {keepLoggedIn && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <span style={{ fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.025em', color: '#FFFFFF99' }}>
                    로그인 유지
                  </span>
                </label>
                <Link to="/forgot-password" style={{ fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.025em', color: '#FFFFFF99', textDecoration: 'none' }} className="hover:text-white transition-colors">
                  비밀번호 찾기
                </Link>
              </div>
            </form>

            <div className="flex items-center justify-center" style={{ gap: '6px' }}>
              <span style={{ fontWeight: 400, fontSize: '15px', lineHeight: '22px', letterSpacing: '-0.025em', color: '#FFFFFF99' }}>아직 회원이 아니신가요?</span>
              <button onClick={() => setMode('signup')} style={{ fontWeight: 600, fontSize: '15px', lineHeight: '22px', letterSpacing: '-0.025em', color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:opacity-80 transition-opacity">
                회원가입
              </button>
            </div>
          </div>
        ) : (
          /* ===== SIGNUP ===== */
          <div style={{ width: '500px', maxWidth: '100%', gap: '48px' }} className="flex flex-col items-center">
            <h1 style={{ fontWeight: 600, fontSize: '32px', lineHeight: '42px', letterSpacing: '-0.025em', textAlign: 'center', color: '#FFFFFF' }}>
              회원가입
            </h1>

            <form onSubmit={handleSignup} className="flex flex-col" style={{ width: '500px', maxWidth: '100%', gap: '24px' }}>
              {/* Email */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={labelStyle}>이메일</label>
                <input name="email" type="email" placeholder="이메일을 입력해 주세요" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} style={inputStyle} className="placeholder:text-[#FFFFFF99]" />
              </div>

              {/* Company */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={labelStyle}>회사/단체명</label>
                <input name="company" type="text" placeholder="회사/단체명을 입력해 주세요" value={signupCompany} onChange={(e) => setSignupCompany(e.target.value)} style={inputStyle} className="placeholder:text-[#FFFFFF99]" />
              </div>

              {/* Name */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={labelStyle}>이름</label>
                <input name="name" type="text" placeholder="이름을 입력해 주세요" required value={signupName} onChange={(e) => setSignupName(e.target.value)} style={inputStyle} className="placeholder:text-[#FFFFFF99]" />
              </div>

              {/* Password */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={labelStyle}>비밀번호</label>
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="비밀번호를 입력해 주세요 (8-20자)" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '48px' }} className="placeholder:text-[#FFFFFF99]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFFFFF99] hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <input name="confirmPassword" type="password" placeholder="비밀번호를 한 번 더 입력해 주세요" required value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} style={inputStyle} className="placeholder:text-[#FFFFFF99]" />
              </div>

              {/* Privacy agreement */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setPrivacyAgreed(!privacyAgreed)}
                  className="flex items-center justify-center cursor-pointer flex-shrink-0"
                  style={{
                    width: '18px', height: '18px', borderRadius: '3px',
                    border: privacyAgreed ? 'none' : '1px solid rgba(255,255,255,0.3)',
                    background: privacyAgreed ? '#EB4B29' : 'transparent',
                  }}
                >
                  {privacyAgreed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <span style={{ fontSize: '14px', lineHeight: '20px', color: '#FFFFFF99' }}>
                  <span style={{ color: '#EB4B29' }}>[필수]</span> 개인정보 수집·이용 동의{' '}
                  <Link to="/privacy" style={{ color: '#FFFFFF99', textDecoration: 'underline' }}>보기</Link>
                </span>
              </label>

              {/* Signup Button */}
              <button type="submit" disabled={isLoading || !isSignupFormValid} style={{ width: '100%', height: '56px', borderRadius: '6px', padding: '16px', background: isSignupFormValid ? '#EB4B29' : '#3D3D3D', border: 'none', fontWeight: 600, fontSize: '16px', lineHeight: '24px', letterSpacing: '-0.025em', textAlign: 'center' as const, color: isSignupFormValid ? '#FFFFFF' : '#FFFFFF99', cursor: (isLoading || !isSignupFormValid) ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1, transition: 'background 0.3s ease' }}>
                {isLoading ? "가입 중..." : "가입하기"}
              </button>
            </form>

            <div className="flex items-center justify-center" style={{ gap: '6px' }}>
              <span style={{ fontWeight: 400, fontSize: '15px', lineHeight: '22px', letterSpacing: '-0.025em', color: '#FFFFFF99' }}>이미 회원이신가요?</span>
              <button onClick={() => setMode('login')} style={{ fontWeight: 600, fontSize: '15px', lineHeight: '22px', letterSpacing: '-0.025em', color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:opacity-80 transition-opacity">
                로그인
              </button>
            </div>
          </div>
        )}
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

export default Auth;
