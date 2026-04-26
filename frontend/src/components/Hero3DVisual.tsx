import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Receipt, Wifi, Zap, ShieldCheck } from "lucide-react";

export default function Hero3DVisual() {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the mouse movement
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  // EXAGGERATED ROTATION for intense 3D effect mapped to angles (-35deg to 35deg)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [35, -35]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-35, 35]);

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
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[600px] flex items-center justify-center perspective-[1200px] select-none"
      style={{ perspective: 1200 }}
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

        {/* LAYER -2: Deepest Abstract Shield */}
        <motion.div
          style={{ transform: "translateZ(-150px) translateX(-80px) translateY(50px)" }}
          className="absolute w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400/50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <ShieldCheck size={40} />
        </motion.div>

        {/* LAYER -1: Receipt with internal 3D elements */}
        <motion.div
          style={{ transform: "translateZ(-60px) translateX(50px) translateY(-40px)", transformStyle: "preserve-3d" }}
          className="absolute w-64 p-6 bg-surface/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl right-0 top-10"
        >
          <div className="flex items-center gap-3 mb-5" style={{ transform: "translateZ(20px)" }}>
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
              <Receipt size={20} />
            </div>
            <div>
              <div className="h-3 w-24 bg-white/20 rounded mb-2 shadow-sm" />
              <div className="h-2 w-16 bg-white/10 rounded" />
            </div>
          </div>
          <div className="space-y-4" style={{ transform: "translateZ(10px)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-2 w-20 bg-white/10 rounded" />
                <div className="h-2 w-12 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* LAYER 0: The Credit Card with MASSIVE INTERNAL PARALLAX */}
        <motion.div
          style={{ transform: "translateZ(80px) rotateZ(-5deg)", transformStyle: "preserve-3d" }}
          className="absolute w-[360px] h-[220px] rounded-2xl p-7 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl border border-white/20 z-10 bg-gradient-to-br from-white/20 to-white/5 left-4 bottom-16"
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIvPgo8L3N2Zz4=')] pointer-events-none rounded-2xl" />
          
          <div className="relative z-10 h-full flex flex-col justify-between" style={{ transformStyle: "preserve-3d" }}>
            {/* FLOATING CHIP & LOGO */}
            <div className="flex justify-between items-start" style={{ transform: "translateZ(30px)" }}>
              <Wifi size={32} className="text-white/80 rotate-90 drop-shadow-lg" />
              <div className="text-white/90 font-mono tracking-[0.3em] font-bold text-sm drop-shadow-md">
                FTD PREMIUM
              </div>
            </div>
            
            <div style={{ transformStyle: "preserve-3d" }}>
              {/* FLOATING CARD NUMBER */}
              <div 
                className="font-mono text-2xl tracking-[0.15em] text-white/95 mb-5 font-bold drop-shadow-[0_8px_15px_rgba(0,0,0,0.4)]"
                style={{ transform: "translateZ(50px)" }}
              >
                **** **** **** 4242
              </div>
              <div className="flex justify-between items-end" style={{ transform: "translateZ(25px)" }}>
                <div className="text-white/80 text-xs">
                  <div className="mb-1 font-semibold tracking-wider text-[10px]">CARDHOLDER</div>
                  <div className="font-bold text-white tracking-widest text-sm drop-shadow-md">
                    VALUED MEMBER
                  </div>
                </div>
                <div className="flex gap-4 items-end">
                  <div className="text-white/80 text-xs text-right">
                    <div className="mb-1 font-semibold tracking-wider text-[10px]">VALID THRU</div>
                    <div className="font-bold text-white tracking-widest text-sm drop-shadow-md">
                      12/28
                    </div>
                  </div>
                  {/* FLOATING MASTERCARD CIRCLES */}
                  <div className="flex -space-x-3 pb-0.5" style={{ transform: "translateZ(40px)" }}>
                    <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-screen shadow-lg" />
                    <div className="w-8 h-8 rounded-full bg-amber-500/80 mix-blend-screen shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Glare Effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-2xl opacity-60"
            style={{
              background: useTransform([x, y], ([latestX, latestY]: number[]) => {
                const posX = (latestX + 0.5) * 100;
                const posY = (latestY + 0.5) * 100;
                return `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`;
              }),
            }}
          />
        </motion.div>

        {/* LAYER 1: Foreground Zap Icon */}
        <motion.div
          style={{ transform: "translateZ(180px) translateX(100px) translateY(80px)" }}
          className="absolute w-16 h-16 bg-cyan-500/20 backdrop-blur-xl border border-cyan-400/40 rounded-full flex items-center justify-center text-cyan-400 right-10 bottom-24 shadow-[0_10px_40px_rgba(34,211,238,0.4)]"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Inner icon also floats inside the circle */}
          <Zap size={28} style={{ transform: "translateZ(20px)" }} />
        </motion.div>

        {/* Fake 3D Floor Shadow that moves opposite to the card */}
        <motion.div
          className="absolute bottom-[-100px] w-72 h-20 bg-black/40 blur-[40px] rounded-[100%]"
          style={{
            transform: useTransform(
              [x, y],
              ([latestX, latestY]: number[]) => `translateX(${latestX * -50}px) translateY(${latestY * -30}px) scale(${1 - latestY * 0.2})`
            )
          }}
        />
      </motion.div>
    </div>
  );
}
