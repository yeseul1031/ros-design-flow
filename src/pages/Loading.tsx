import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AIMatching = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const savedItems = location.state?.savedItems || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/designer-search', { state: { savedItems } });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate, savedItems]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: '#111111' }}>
      {/* Glow line animation */}
      <div style={{ width: '286px', height: '121px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Base grey line */}
        <div style={{ width: '286px', height: '2px', background: '#222222', position: 'relative', borderRadius: '1px' }}>
          {/* Animated orange fill with glow */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{
              duration: 3,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1], // ease-out
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '2px',
              borderRadius: '1px',
              background: 'linear-gradient(90deg, #111111 0%, #EB4B29 60%, #EB4B29 100%)',
            }}
          >
            {/* Glow orb at the leading edge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                position: 'absolute',
                right: '-30px',
                top: '-30px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(235,75,41,0.3) 0%, rgba(235,75,41,0.1) 40%, transparent 70%)',
                filter: 'blur(8px)',
                pointerEvents: 'none',
              }}
            />
            {/* Bright glow at tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.6] }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{
                position: 'absolute',
                right: '-4px',
                top: '-5px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(235,75,41,0.8) 0%, rgba(235,75,41,0.2) 60%, transparent 100%)',
                filter: 'blur(3px)',
                pointerEvents: 'none',
              }}
            />
            {/* White highlight line overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.4) 85%, rgba(255,255,255,0.6) 100%)',
                borderRadius: '1px',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          marginTop: '32px',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '24px',
          letterSpacing: '-0.025em',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
        }}
      >
        선택한 포트폴리오를 분석 중 입니다
      </motion.p>
    </div>
  );
};

export default AIMatching;
