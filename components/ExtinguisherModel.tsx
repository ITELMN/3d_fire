
import React from 'react';
import { SimulationStep } from '../types';

interface ExtinguisherModelProps {
  aimX: number; 
  isSqueezing: boolean;
  step: SimulationStep;
}

const ExtinguisherModel: React.FC<ExtinguisherModelProps> = ({ aimX, isSqueezing, step }) => {
  // Logic for zoom/focus based on step
  const isInspect = step === SimulationStep.INSPECT;
  const isPull = step === SimulationStep.PULL;
  const isPinPulled = step !== SimulationStep.INTRO && step !== SimulationStep.INSPECT && step !== SimulationStep.PULL;
  const isAimingOrFiring = step === SimulationStep.AIM || step === SimulationStep.SQUEEZE || step === SimulationStep.SWEEP;

  // Body moves slightly
  const bodyRotationY = aimX * 15; 
  const bodyTranslateX = aimX * 30; 

  // Hose moves significantly to "Aim"
  // Base angle -75deg (Pointing Up-Right)
  // AimX -1 (Left) -> Should point more Left (Rotate CCW, e.g. -100deg)
  // AimX 1 (Right) -> Should point more Right (Rotate CW, e.g. -50deg)
  const hoseRotation = -75 + (aimX * 25); 

  // Zoom transforms
  let containerTransform = `translate(-50%, -40%) perspective(1000px) scale(0.6) rotateY(${bodyRotationY}deg) translateX(${bodyTranslateX}px)`;
  
  if (isInspect) {
    containerTransform = `translate(-50%, -30%) perspective(1000px) scale(1.6) translateY(50px)`;
  } else if (isPull) {
    containerTransform = `translate(-50%, -30%) perspective(1000px) scale(1.3) rotateY(-15deg) translateY(60px)`;
  }

  return (
    <div 
      className="absolute top-1/2 left-1/2 z-10 transition-transform duration-500 ease-out will-change-transform"
      style={{ 
        transform: containerTransform,
        width: '200px',
        height: '450px'
      }}
    >
      {/* 
        REALISTIC CSS EXTINGUISHER MODEL 
      */}

      {/* --- TANK BODY --- */}
      <div className="absolute bottom-0 w-full h-[320px] rounded-[20px] rounded-t-[50px] overflow-hidden shadow-2xl">
         {/* Metallic Red Gradient */}
         <div className="absolute inset-0 bg-gradient-to-r from-[#500000] via-[#d00000] to-[#400000]"></div>
         
         {/* Dynamic Fire Reflection on the Tank */}
         {isAimingOrFiring && (
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-transparent mix-blend-overlay animate-pulse"></div>
         )}
         
         {/* Specular Highlight (The "Shine") moves opposite to rotation */}
         <div 
            className="absolute top-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-md transition-all duration-300"
            style={{ left: `${25 - aimX * 10}%` }}
         ></div>
         
         {/* Shadow side */}
         <div className="absolute top-0 bottom-0 right-0 w-[40px] bg-gradient-to-l from-black/60 to-transparent"></div>
         
         {/* Label */}
         <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[140px] h-[180px] bg-gray-100 rounded-sm shadow-sm flex flex-col p-2 opacity-95">
            <div className="h-6 bg-yellow-400 mb-1 flex items-center justify-center border border-black/10">
               <span className="text-[6px] font-bold text-black tracking-widest">使用说明</span>
            </div>
            <div className="flex-1 flex flex-col gap-2 opacity-80">
                <div className="flex gap-2 items-center"><div className="w-5 h-5 bg-black/10 rounded-full"></div><div className="h-1 w-full bg-black/10"></div></div>
                <div className="flex gap-2 items-center"><div className="w-5 h-5 bg-black/10 rounded-full"></div><div className="h-1 w-full bg-black/10"></div></div>
                <div className="flex gap-2 items-center"><div className="w-5 h-5 bg-black/10 rounded-full"></div><div className="h-1 w-full bg-black/10"></div></div>
            </div>
            <div className="mt-auto h-4 bg-red-600 flex items-center justify-center text-[6px] text-white font-bold">ABC 干粉</div>
         </div>
      </div>

      {/* --- NECK --- */}
      <div className="absolute bottom-[320px] left-1/2 -translate-x-1/2 w-[80px] h-[30px] bg-gradient-to-r from-gray-900 via-gray-700 to-black rounded-t-lg z-20"></div>

      {/* --- VALVE --- */}
      <div className="absolute bottom-[350px] left-1/2 -translate-x-1/2 w-[50px] h-[60px] z-20">
         <div className="w-full h-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-800 rounded-md border border-yellow-900/50 shadow-lg"></div>
         {/* Hose Connector */}
         <div className="absolute top-4 -left-4 w-6 h-6 bg-black rounded-full shadow-inner"></div>
      </div>

      {/* --- HOSE (The critical part for aiming) --- */}
      <div 
        className="absolute bottom-[100px] left-[-40px] w-[140px] h-[300px] z-30 transition-transform duration-75 ease-linear"
        style={{
           transformOrigin: '85px 20px', 
           transform: isAimingOrFiring ? `rotate(${hoseRotation}deg) translate(-10px, -5px)` : 'rotate(0deg)'
        }}
      >
          {/* Hose Pipe */}
          <svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="none" className="drop-shadow-xl overflow-visible">
             <path 
               d="M 85 20 Q 20 50 10 200" 
               fill="none" 
               stroke="#1a1a1a" 
               strokeWidth="14" 
               strokeLinecap="round"
             />
             <path 
               d="M 85 20 Q 20 50 10 200" 
               fill="none" 
               stroke="#333" 
               strokeWidth="4" 
               strokeLinecap="round"
               className="opacity-40"
             />
          </svg>
          {/* Nozzle Tip */}
          <div className="absolute bottom-0 left-[0px] w-8 h-12 bg-black rounded-sm border-t border-gray-600 shadow-xl">
              {/* Nozzle opening glow when firing */}
              {isSqueezing && (
                  <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-10 h-20 bg-white/20 blur-md rounded-full"></div>
              )}
          </div>
      </div>

      {/* --- HANDLES --- */}
      {/* Bottom Handle */}
      <div className="absolute bottom-[360px] left-[60%] w-[90px] h-[12px] bg-black rounded-full transform rotate-[-10deg] z-10 shadow-lg border-b border-gray-700"></div>

      {/* Top Handle (Trigger) */}
      <div 
        className="absolute bottom-[390px] left-[60%] w-[90px] h-[12px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-full transform origin-left z-20 transition-transform duration-100 shadow-md border border-gray-400"
        style={{ transform: isSqueezing ? 'rotate(5deg) translateY(10px)' : 'rotate(-15deg)' }}
      ></div>

      {/* --- GAUGE --- */}
      <div className={`absolute bottom-[365px] left-[45px] w-[36px] h-[36px] bg-gray-200 rounded-full border-2 border-gray-400 z-30 shadow-md ${isInspect ? 'animate-pulse' : ''}`}>
         <div className="absolute inset-[2px] bg-white rounded-full overflow-hidden">
             <div className="absolute top-0 right-0 w-full h-full bg-green-500 opacity-20" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0)' }}></div>
             <div className="absolute top-1/2 left-1/2 w-[1px] h-[14px] bg-red-600 origin-bottom transform -translate-x-1/2 -translate-y-full rotate-[10deg]"></div>
             <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent rounded-full pointer-events-none"></div>
      </div>

      {/* --- SAFETY PIN --- */}
      <div 
        className={`absolute bottom-[365px] left-[85px] z-20 transition-all duration-500 ${isPinPulled ? 'opacity-0 translate-x-20' : 'opacity-100'}`}
      >
         <div className={`relative ${isPull ? 'animate-pulse' : ''}`}>
             <div className="w-8 h-8 rounded-full border-4 border-gray-300 shadow-sm"></div>
             <div className="absolute top-1/2 right-full w-10 h-1 bg-gray-300"></div>
         </div>
      </div>

    </div>
  );
};

export default ExtinguisherModel;
