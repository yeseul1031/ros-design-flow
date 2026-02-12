import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#111111' }}>
      <div className="flex flex-col items-center" style={{ gap: '48px' }}>
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

        {/* Text + Progress */}
        <div className="flex flex-col items-center" style={{ gap: '24px' }}>
          <h2
            style={{
              fontWeight: 600,
              fontSize: '32px',
              lineHeight: '42px',
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            AI 매칭 진행 중
          </h2>
          <p style={{ fontWeight: 400, fontSize: '16px', lineHeight: '24px', color: '#FFFFFFCC', textAlign: 'center' }}>
            당신의 비전과 완벽하게 맞는 크리에이터를 찾고 있습니다
          </p>

          <div style={{ width: '384px', maxWidth: '100%' }} className="space-y-3">
            <div
              className="relative overflow-hidden rounded-full"
              style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, background: '#EB4B29' }}
              />
            </div>
            <p style={{ fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              {progress}% 완료
            </p>
          </div>
        </div>
      </div>

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
