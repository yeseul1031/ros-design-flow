import { useEffect, useState } from "react";

interface AIMatchingLoaderProps {
  onComplete: () => void;
}

export const AIMatchingLoader = ({ onComplete }: AIMatchingLoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
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
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated circles */}
        <div className="relative w-48 h-48 mx-auto">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-primary rounded-full"
              style={{
                left: '50%',
                top: '50%',
                animation: `orbit-${i} 2s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">AI 매칭 진행 중</h2>
          <p className="text-muted-foreground">
            최적의 크리에이터를 찾고 있습니다...
          </p>
          <div className="w-64 mx-auto bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style>{`
        ${[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const radius = 70;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return `
            @keyframes orbit-${i} {
              0%, 100% {
                transform: translate(-50%, -50%) translate(${x}px, ${y}px);
                opacity: 0.3;
                scale: 0.5;
              }
              50% {
                transform: translate(-50%, -50%) translate(0, 0);
                opacity: 1;
                scale: 1.2;
              }
            }
          `;
        }).join('\n')}
      `}</style>
    </div>
  );
};
