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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-12 relative z-10">
        {/* Animated circles - dreamlike and ethereal */}
        <div className="relative w-80 h-80 mx-auto">
          {/* Outer glow rings */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border-2 border-white/20"
              style={{
                animation: `pulse-ring ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          
          {/* Orbiting particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(147,51,234,0.4) 100%)`,
                boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(147,51,234,0.3)',
                left: '50%',
                top: '50%',
                animation: `orbit-${i} ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          
          {/* Center core with pulsing glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-purple-400/40 via-pink-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse" />
              <div className="absolute inset-0 w-40 h-40 bg-gradient-to-tr from-white/30 to-transparent rounded-full animate-spin-slow" 
                   style={{ animationDuration: '8s' }} />
            </div>
          </div>
          
          {/* Floating sparkles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `sparkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                boxShadow: '0 0 10px rgba(255,255,255,0.8)',
              }}
            />
          ))}
        </div>

        {/* Text with glow effect */}
        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            AI 매칭 진행 중
          </h2>
          <p className="text-2xl text-purple-200 drop-shadow-[0_0_20px_rgba(192,132,252,0.5)]">
            최적의 크리에이터를 찾고 있습니다...
          </p>
          <div className="w-96 mx-auto bg-white/10 backdrop-blur-md rounded-full h-4 overflow-hidden shadow-2xl border border-white/20">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 transition-all duration-300 shadow-[0_0_30px_rgba(192,132,252,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-lg text-purple-300 drop-shadow-lg">{progress}%</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-50px) translateX(30px);
            opacity: 0.6;
          }
        }

        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.3;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        ${[...Array(20)].map((_, i) => {
          const angle = (i * 18) * (Math.PI / 180);
          const radius = 120 + (i % 3) * 20;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return `
            @keyframes orbit-${i} {
              0%, 100% {
                transform: translate(-50%, -50%) translate(${x}px, ${y}px) scale(0.5);
                opacity: 0.3;
              }
              25% {
                transform: translate(-50%, -50%) translate(${-y}px, ${x}px) scale(1);
                opacity: 0.8;
              }
              50% {
                transform: translate(-50%, -50%) translate(${-x}px, ${-y}px) scale(1.2);
                opacity: 1;
              }
              75% {
                transform: translate(-50%, -50%) translate(${y}px, ${-x}px) scale(0.8);
                opacity: 0.6;
              }
            }
          `;
        }).join('\n')}
      `}</style>
    </div>
  );
};

export default AIMatching;
