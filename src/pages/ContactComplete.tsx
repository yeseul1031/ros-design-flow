import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";
import arrowRightIcon from "@/assets/arrow-right-icon.svg";

export default function ContactComplete() {
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

      {/* Content - centered vertically and horizontally */}
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
        <div 
          className="flex flex-col items-center justify-center"
          style={{ width: '1026px', maxWidth: '100%', height: '178px', gap: '32px' }}
        >
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
            접수완료
          </h1>

          {/* Description */}
          <p
            style={{
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '-0.025em',
              textAlign: 'center',
              color: '#FFFFFFCC',
            }}
          >
            접수가 완료되었습니다.<br />
            담당자가 확인 후 빠르게 연락드리겠습니다.
          </p>

          {/* Back to Main */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0',
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            BACK TO MAIN
            <img src={arrowRightIcon} alt="arrow" className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
