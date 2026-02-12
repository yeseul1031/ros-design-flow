import { useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import logoSvg from "@/assets/logo.svg";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const isFormValid = email.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Call custom edge function to send branded reset email
      const { error: fnError } = await supabase.functions.invoke("send-reset-password", {
        body: { email },
      });

      if (fnError) throw fnError;

      // Also trigger Supabase's native reset so the token/link works
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setSent(true);
    } catch {
      // silently handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await supabase.functions.invoke("send-reset-password", { body: { email } });
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // silently handle
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
            {sent ? '메일함을 확인해주세요' : '비밀번호 찾기'}
          </h1>

          {sent ? (
            <div className="flex flex-col items-center" style={{ gap: '24px', width: '500px', maxWidth: '100%' }}>
              <p style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px', letterSpacing: '-0.025em', textAlign: 'center', color: '#FFFFFF99' }}>
                입력하신 이메일 주소로<br />
                비밀번호를 재설정할 수 있는 링크를 보내드렸습니다.
              </p>
              <div className="flex items-center" style={{ gap: '6px' }}>
                <span style={{ fontWeight: 400, fontSize: '15px', lineHeight: '22px', letterSpacing: '-0.025em', color: '#FFFFFF99' }}>
                  메일이 오지 않으셨나요?
                </span>
                <button
                  onClick={() => setSent(false)}
                  disabled={isLoading}
                  style={{ fontWeight: 600, fontSize: '15px', lineHeight: '22px', letterSpacing: '-0.025em', color: '#FFFFFF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  재발송하기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col" style={{ width: '500px', maxWidth: '100%', gap: '24px' }}>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <label style={labelStyle}>이메일</label>
                <input
                  type="email"
                  placeholder="이메일을 입력해 주세요"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? "전송 중..." : "비밀번호 재설정 메일 발송하기"}
              </button>
            </form>
          )}

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

export default ForgotPassword;
