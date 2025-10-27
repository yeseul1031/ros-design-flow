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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-12">
        {/* Animated circles - larger and more impactful */}
        <div className="relative w-64 h-64 mx-auto">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg"
              style={{
                left: '50%',
                top: '50%',
                animation: `orbit-${i} 2.5s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full animate-pulse shadow-2xl" />
          </div>
          
          {/* Center glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            AI 매칭 진행 중
          </h2>
          <p className="text-xl text-muted-foreground">
            최적의 크리에이터를 찾고 있습니다...
          </p>
          <div className="w-80 mx-auto bg-muted/50 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground/70">{progress}%</p>
        </div>
      </div>

      <style>{`
        ${[...Array(16)].map((_, i) => {
          const angle = (i * 22.5) * (Math.PI / 180);
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return `
            @keyframes orbit-${i} {
              0%, 100% {
                transform: translate(-50%, -50%) translate(${x}px, ${y}px) scale(0.6);
                opacity: 0.4;
              }
              50% {
                transform: translate(-50%, -50%) translate(0, 0) scale(1.3);
                opacity: 1;
              }
            }
          `;
        }).join('\n')}
      `}</style>
    </div>
  );
};

export default AIMatching;
