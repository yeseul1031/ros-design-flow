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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950/95 via-purple-900/90 to-violet-950/95 flex items-center justify-center overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="text-center space-y-16 relative z-10">
        {/* Gentle animated circles */}
        <div className="relative w-96 h-96 mx-auto">
          {/* Slow rotating outer ring */}
          <div 
            className="absolute inset-0 rounded-full border border-white/10"
            style={{
              animation: 'rotate-slow 20s linear infinite',
            }}
          />
          
          {/* Gentle pulsing rings */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute rounded-full border border-white/5"
              style={{
                inset: `${20 + i * 25}px`,
                animation: `gentle-pulse ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
          
          {/* Slowly orbiting particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full bg-white/30"
              style={{
                left: '50%',
                top: '50%',
                animation: `smooth-orbit-${i} ${12 + i * 2}s ease-in-out infinite`,
                boxShadow: '0 0 15px rgba(255,255,255,0.3)',
              }}
            />
          ))}
          
          {/* Center glow - soft and gentle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Main glow */}
              <div 
                className="w-48 h-48 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%)',
                  animation: 'soft-glow 4s ease-in-out infinite',
                }}
              />
              {/* Secondary glow */}
              <div 
                className="absolute inset-0 w-48 h-48 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(196, 181, 253, 0.15) 0%, transparent 70%)',
                  animation: 'soft-glow 6s ease-in-out infinite reverse',
                }}
              />
            </div>
          </div>
          
          {/* Gentle floating elements */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`float-${i}`}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animation: `gentle-float ${8 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Text with soft shadow */}
        <div className="space-y-8">
          <h2 className="text-5xl font-bold text-white/90" style={{
            textShadow: '0 0 40px rgba(167, 139, 250, 0.3)',
          }}>
            AI 매칭 진행 중
          </h2>
          <p className="text-xl text-purple-200/80">
            최적의 크리에이터를 찾고 있습니다...
          </p>
          
          {/* Progress bar with gentle animation */}
          <div className="w-96 mx-auto bg-white/5 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-purple-400/60 via-violet-400/60 to-indigo-400/60 transition-all duration-500 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(167, 139, 250, 0.4)',
              }}
            />
          </div>
          <p className="text-sm text-purple-300/60">{progress}%</p>
        </div>
      </div>

      <style>{`
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.4;
          }
        }

        @keyframes soft-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes gentle-float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        ${[...Array(8)].map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const radius = 140;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return `
            @keyframes smooth-orbit-${i} {
              0% {
                transform: translate(-50%, -50%) translate(${x}px, ${y}px);
                opacity: 0.4;
              }
              50% {
                transform: translate(-50%, -50%) translate(${-x}px, ${-y}px);
                opacity: 0.7;
              }
              100% {
                transform: translate(-50%, -50%) translate(${x}px, ${y}px);
                opacity: 0.4;
              }
            }
          `;
        }).join('\n')}
      `}</style>
    </div>
  );
};

export default AIMatching;
