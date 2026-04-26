import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Receipt, Wifi, Zap, BarChart3, Bell, CircleDollarSign } from 'lucide-react';

export default function Hero3DVisual() {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the mouse movement for the 3D tilt
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // Calculate rotation based on mouse position (-0.5 to 0.5) mapped to angles
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [25, -25]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-25, 25]);

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
      className="relative w-full h-[600px] flex items-center justify-center perspective-[2000px] select-none"
      style={{ perspective: 2000 }}
      aria-hidden="true"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full max-w-lg aspect-square flex items-center justify-center"
      >
        {/* Glow behind everything */}
        <div 
          className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" 
          style={{ transform: "translateZ(-200px)" }}
        />

        {/* --- LAYER -2: Abstract Shape --- */}
        <motion.div
          style={{ transform: "translateZ(-120px) translateX(-60px) translateY(40px)" }}
          className="absolute w-40 h-40 rounded-full border-[10px] border-violet-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* --- LAYER -1: Analytics Chart Snippet --- */}
        <motion.div
          style={{ transform: "translateZ(-80px) translateX(-80px) translateY(-60px)" }}
          className="absolute w-56 p-5 bg-surface/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl left-0 top-10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <BarChart3 size={16} />
            </div>
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="flex items-end gap-2 h-20">
            <div className="w-1/4 bg-white/10 rounded-t-md h-[40%]" />
            <div className="w-1/4 bg-white/10 rounded-t-md h-[70%]" />
            <div className="w-1/4 bg-amber-400/80 rounded-t-md h-[100%] shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
            <div className="w-1/4 bg-white/10 rounded-t-md h-[50%]" />
          </div>
        </motion.div>

        {/* --- LAYER 0: Receipt / Transaction List --- */}
        <motion.div
          style={{ transform: "translateZ(-30px) translateX(60px) translateY(-20px)" }}
          className="absolute w-64 p-6 bg-surface/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl right-0 top-16"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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

        {/* --- LAYER 1: Credit Card Glassmorphism --- */}
        <motion.div
          style={{ transform: "translateZ(60px) rotateZ(-6deg)" }}
          className="absolute w-[360px] h-[220px] rounded-[1.5rem] p-7 shadow-2xl backdrop-blur-2xl border border-white/20 z-10 overflow-hidden bg-gradient-to-br from-white/20 to-white/5"
        >
          {/* Card noise/texture overlay for realism */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPgo8L3N2Zz4=')] pointer-events-none" />
          
          {/* Glare effect on the card that follows mouse exactly */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
            style={{
              background: useTransform(
                [x, y],
                ([latestX, latestY]: number[]) => {
                  const posX = (latestX + 0.5) * 100;
                  const posY = (latestY + 0.5) * 100;
                  return `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`;
                }
              )
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Wifi size={28} className="text-white/70 rotate-90" />
              <div className="text-white/90 font-mono tracking-[0.3em] font-bold text-sm drop-shadow-md">FTD PREMIUM</div>
            </div>
            
            <div>
              <div className="font-mono text-[1.4rem] tracking-[0.18em] text-white/95 mb-5 font-semibold drop-shadow-lg">
                **** **** **** 4242
              </div>
              <div className="flex justify-between items-end">
                <div className="text-white/70 text-xs">
                  <div className="mb-1 font-semibold tracking-wider text-[10px]">CARDHOLDER</div>
                  <div className="font-bold text-white/90 tracking-widest text-sm">NGUYEN VAN A</div>
                </div>
                <div className="flex gap-4 items-end">
                  <div className="text-white/70 text-xs text-right">
                    <div className="mb-1 font-semibold tracking-wider text-[10px]">VALID THRU</div>
                    <div className="font-bold text-white/90 tracking-widest text-sm">12/28</div>
                  </div>
                  {/* Mastercard-style circles */}
                  <div className="flex -space-x-3 pb-0.5">
                    <div className="w-7 h-7 rounded-full bg-red-500/80 mix-blend-screen shadow-sm" />
                    <div className="w-7 h-7 rounded-full bg-amber-500/80 mix-blend-screen shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- LAYER 2: Notification Badge --- */}
        <motion.div
          style={{ transform: "translateZ(100px) translateX(-140px) translateY(-10px)" }}
          className="absolute bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 left-10 top-1/3"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 relative">
            <Bell size={16} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/90">Renewal Saved</div>
            <div className="text-[10px] text-green-400">+$12.99</div>
          </div>
        </motion.div>

        {/* --- LAYER 3: Floating Accent Icon (Zap) --- */}
        <motion.div
          style={{ transform: "translateZ(150px) translateX(120px) translateY(80px)" }}
          className="absolute w-16 h-16 bg-cyan-500/20 backdrop-blur-xl border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-400 right-16 bottom-24 shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap size={28} />
        </motion.div>

        {/* --- LAYER 4: Continuous Spinning Coin (DollarSign) --- */}
        <motion.div
          style={{ transform: "translateZ(200px) translateX(-80px) translateY(120px)" }}
          className="absolute w-12 h-12 rounded-full flex items-center justify-center text-amber-400 left-24 bottom-16 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
          animate={{ rotateY: 360, y: [0, -10, 0] }}
          transition={{ 
            rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Simulated 3D Coin Body */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border border-amber-200/50" />
          <CircleDollarSign size={24} className="relative z-10 drop-shadow-md text-amber-900" />
        </motion.div>

        {/* Global Light reflection effect that moves with the mouse over the entire container */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-full"
          style={{
            transform: "translateZ(250px)",
            background: useTransform(
              [x, y],
              ([latestX, latestY]: number[]) => {
                const posX = (latestX + 0.5) * 100;
                const posY = (latestY + 0.5) * 100;
                return `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.05) 0%, transparent 60%)`;
              }
            )
          }}
        />
      </motion.div>
    </div>
  );
}
