import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);
  
  return (
    <>
      {/* Main glow */}
      <motion.div
        className="cursor-glow"
        style={{
          left: smoothX,
          top: smoothY,
          opacity: isVisible ? 0.6 : 0,
          width: 30,
          height: 30,
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)',
        }}
      />
      
      {/* Trail effect */}
      <motion.div
        className="cursor-glow"
        style={{
          left: smoothX,
          top: smoothY,
          opacity: isVisible ? 0.3 : 0,
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(255, 0, 255, 0.2) 0%, transparent 70%)',
        }}
        transition={{ delay: 0.05 }}
      />
    </>
  );
}
