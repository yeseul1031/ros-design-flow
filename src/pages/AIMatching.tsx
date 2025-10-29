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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f0519] flex items-center justify-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-blob"
          style={{ animationDelay: '0s' }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl animate-blob"
          style={{ animationDelay: '2s' }}
        />
        <div 
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-blob"
          style={{ animationDelay: '4s' }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="text-center space-y-16 relative z-10 px-4">
        {/* Main animation container */}
        <div className="relative w-[500px] h-[500px] mx-auto">
          {/* Rotating gradient rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`gradient-ring-${i}`}
              className="absolute rounded-full"
              style={{
                inset: `${i * 60}px`,
                background: `conic-gradient(from ${i * 120}deg, 
                  transparent, 
                  rgba(147, 51, 234, ${0.3 - i * 0.1}), 
                  rgba(236, 72, 153, ${0.3 - i * 0.1}), 
                  transparent)`,
                animation: `spin-slow ${20 + i * 10}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}`,
              }}
            />
          ))}

          {/* Floating geometric shapes */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div
                key={`shape-${i}`}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  animation: `float-orbit ${15 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                <div 
                  className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-sm backdrop-blur-sm"
                  style={{
                    transform: `rotate(${i * 15}deg)`,
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
                  }}
                />
              </div>
            );
          })}

          {/* Center ethereal glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Main glow orb */}
              <div 
                className="w-64 h-64 rounded-full animate-pulse-slow"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4), rgba(147, 51, 234, 0.3), transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />
              
              {/* Inner shine */}
              <div 
                className="absolute inset-0 w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.2), transparent 60%)',
                  animation: 'shimmer 3s ease-in-out infinite',
                }}
              />

              {/* Particle system */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 bg-white/60 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mesh grid overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={`mesh-${i}`}
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
                style={{
                  top: `${(i + 1) * 12.5}%`,
                  animation: `wave-horizontal ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Typography with gradient */}
        <div className="space-y-8">
          <h2 
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-200 to-purple-300 animate-gradient-x"
            style={{
              textShadow: '0 0 80px rgba(236, 72, 153, 0.5)',
              fontFamily: 'Pretendard, -apple-system, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            AI 매칭 진행 중
          </h2>
          <p className="text-xl text-purple-200/90 font-light tracking-wide">
            당신의 비전과 완벽하게 맞는 크리에이터를 찾고 있습니다
          </p>
          
          {/* Modern progress bar */}
          <div className="w-96 mx-auto space-y-3">
            <div className="relative h-2 bg-white/5 backdrop-blur-sm rounded-full overflow-hidden border border-white/10">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 30px rgba(236, 72, 153, 0.6)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-x 3s ease infinite',
                }}
              />
              {/* Gleam effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  animation: 'gleam 2s ease-in-out infinite',
                  transform: `translateX(${progress * 4 - 100}%)`,
                }}
              />
            </div>
            <p className="text-sm text-purple-300/70 font-mono">{progress}% 완료</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-orbit {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) translateY(-30px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.8;
            transform: rotate(180deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes wave-horizontal {
          0%, 100% {
            transform: translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateX(20px);
            opacity: 0.3;
          }
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes gleam {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default AIMatching;
