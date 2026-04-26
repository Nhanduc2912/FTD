import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Receipt, Wifi, Zap } from 'lucide-react';

export default function Hero3DVisual() {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the mouse movement for the 3D tilt
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // Calculate rotation based on mouse position (-0.5 to 0.5) mapped to angles (-20deg to 20deg)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [20, -20]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Reset to center when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[500px] flex items-center justify-center perspective-[1500px] select-none"
      style={{ perspective: 1500 }}
      aria-hidden="true"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-md aspect-square flex items-center justify-center"
      >
        {/* Glow behind everything */}
        <div 
          className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" 
          style={{ transform: "translateZ(-150px)" }}
        />

        {/* 1. Background Layer (Receipt / Analytics snippet) */}
        <motion.div
          style={{ transform: "translateZ(-60px) translateY(-30px)" }}
          className="absolute w-64 p-6 bg-surface/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl right-6 top-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
              <Receipt size={20} />
            </div>
            <div>
              <div className="h-3.5 w-24 bg-white/10 rounded mb-2" />
              <div className="h-2.5 w-16 bg-white/5 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-2 w-20 bg-white/10 rounded" />
                <div className="h-2 w-12 bg-white/10 rounded" />
              </div>
            ))}
            <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
              <div className="h-3 w-12 bg-white/20 rounded" />
              <div className="h-3 w-20 bg-primary/60 rounded" />
            </div>
          </div>
        </motion.div>

        {/* 2. Middle Layer (Credit Card Glassmorphism) */}
        <motion.div
          style={{ transform: "translateZ(40px) rotateZ(-6deg)" }}
          className="absolute w-[340px] h-[210px] rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/20 left-2 bottom-16 overflow-hidden bg-gradient-to-br from-white/15 to-white/5"
        >
          {/* Card noise/texture overlay for realism */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPgo8L3N2Zz4=')] pointer-events-none" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Wifi size={28} className="text-white/60 rotate-90" />
              <div className="text-white/80 font-mono tracking-[0.3em] font-bold text-sm">FTD CARD</div>
            </div>
            
            <div>
              <div className="font-mono text-2xl tracking-[0.15em] text-white/90 mb-4 font-medium drop-shadow-md">
                **** **** **** 4242
              </div>
              <div className="flex justify-between items-center">
                <div className="text-white/60 text-xs">
                  <div className="mb-1 font-semibold tracking-wider">CARDHOLDER</div>
                  <div className="font-medium text-white/90 tracking-widest">NGUYEN VAN A</div>
                </div>
                <div className="text-white/60 text-xs text-right">
                  <div className="mb-1 font-semibold tracking-wider">VALID THRU</div>
                  <div className="font-medium text-white/90 tracking-widest">12/28</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Foreground Layer (Floating Accent Icon) */}
        <motion.div
          style={{ transform: "translateZ(120px)" }}
          className="absolute w-16 h-16 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-400 right-10 bottom-24 shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap size={28} />
        </motion.div>

        {/* Light reflection effect that moves with the mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-full"
          style={{
            transform: "translateZ(60px)",
            background: useTransform(
              [x, y],
              ([latestX, latestY]: number[]) => {
                const posX = (latestX + 0.5) * 100;
                const posY = (latestY + 0.5) * 100;
                return `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.15) 0%, transparent 50%)`;
              }
            )
          }}
        />
      </motion.div>
    </div>
  );
}
