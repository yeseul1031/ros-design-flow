import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const AIMatching = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const savedItems = location.state?.savedItems || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/designer-search', { state: { savedItems } });
    }, 3000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [navigate, savedItems]);

  return (
    <div className="min-h-screen text-white" style={{ background: '#111111' }}>
      <Header />

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
        {/* Copy area */}
        <div
          className="flex flex-col items-center"
          style={{ width: '1260px', maxWidth: '100%', height: '160px', gap: '24px' }}
        >
          {/* Label */}
          <span
            style={{
              width: '104px',
              height: '28px',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '28px',
              letterSpacing: '0',
              color: '#EB4B29',
              textAlign: 'center',
            }}
          >
            ai matching
          </span>

          {/* Title */}
          <h1
            style={{
              fontWeight: 600,
              fontSize: '56px',
              lineHeight: '72px',
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            당신의 취향, 더 선명하게
          </h1>

          {/* Description */}
          <p
            style={{
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '-0.025em',
              color: '#FFFFFFCC',
              textAlign: 'center',
            }}
          >
            선택한 포트폴리오 기준으로, AI가 가장 어울리는 ROS 디자이너를 매칭합니다.
          </p>
        </div>

        {/* Progress area */}
        <div className="flex flex-col items-center" style={{ gap: '24px' }}>
          {/* Animated orb */}
          <div className="relative" style={{ width: '200px', height: '200px' }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(235, 75, 41, 0.4), rgba(235, 75, 41, 0.15), transparent 70%)',
                filter: 'blur(20px)',
                animation: 'pulse-slow 3s ease-in-out infinite',
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.15), transparent 60%)',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
          </div>

          {/* Progress bar */}
          <div style={{ width: '384px', maxWidth: '100%' }} className="space-y-3">
            <div
              className="relative overflow-hidden rounded-full"
              style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: '#EB4B29',
                }}
              />
            </div>
            <p
              style={{
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
              }}
            >
              AI 매칭 진행 중 · {progress}%
            </p>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; transform: rotate(0deg); }
          50% { opacity: 0.8; transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default AIMatching;
