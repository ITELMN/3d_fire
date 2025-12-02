
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

  // Base transforms
  // When aiming, we slightly rotate the model to simulate looking around the fire
  const rotationY = aimX * 10; // Rotate left/right
  const translateX = aimX * 20; // Move slightly

  // Zoom transforms for specific steps
  // Scale reduced to 0.6 (Smaller)
  // Translated slightly lower (-40%) so fire above is more visible
  let containerTransform = `translate(-50%, -40%) perspective(1000px) scale(0.6) rotateY(${rotationY}deg) translateX(${translateX}px)`;
  
  if (isInspect) {
    containerTransform = `translate(-50%, -30%) perspective(1000px) scale(1.8) translateY(50px)`;
  } else if (isPull) {
    containerTransform = `translate(-50%, -30%) perspective(1000px) scale(1.5) rotateY(-15deg) translateY(60px)`;
  }

  return (
    <div 
      className="absolute top-1/2 left-1/2 z-10 transition-all duration-700 ease-in-out will-change-transform"
      style={{ 
        transform: containerTransform,
        width: '200px',
        height: '450px'
      }}
    >
      {/* 
        REALISTIC CSS EXTINGUISHER 
        Constructed from multiple divs with complex gradients to simulate 3D volume
      */}

      {/* --- TANK BODY --- */}
      <div className="absolute bottom-0 w-full h-[320px] rounded-[20px] rounded-t-[50px] overflow-hidden shadow-2xl">
         {/* Metallic Red Gradient */}
         <div className="absolute inset-0 bg-gradient-to-r from-[#500000] via-[#d00000] to-[#400000]"></div>
         {/* Specular Highlight (The "Shine") */}
         <div className="absolute top-0 bottom-0 left-[25%] w-[40px] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-md"></div>
         {/* Shadow side */}
         <div className="absolute top-0 bottom-0 right-0 w-[40px] bg-gradient-to-l from-black/60 to-transparent"></div>
         
         {/* Label/Instruction Sticker */}
         <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[140px] h-[180px] bg-gray-100 rounded-sm shadow-sm flex flex-col p-2 opacity-95">
            <div className="h-6 bg-yellow-400 mb-1 flex items-center justify-center border border-black/10">
               <span className="text-[6px] font-bold text-black tracking-widest">使用说明</span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 border border-black rounded-full flex items-center justify-center text-[5px]">1</div>
                    <div className="h-[2px] w-full bg-black"></div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 border border-black rounded-full flex items-center justify-center text-[5px]">2</div>
                    <div className="h-[2px] w-full bg-black"></div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 border border-black rounded-full flex items-center justify-center text-[5px]">3</div>
                    <div className="h-[2px] w-full bg-black"></div>
                </div>
            </div>
            <div className="mt-auto h-4 bg-red-600 flex items-center justify-center text-[6px] text-white font-bold">ABC 干粉</div>
         </div>
      </div>

      {/* --- NECK & VALVE ASSEMBLY --- */}
      
      {/* Black Collar */}
      <div className="absolute bottom-[320px] left-1/2 -translate-x-1/2 w-[80px] h-[30px] bg-gradient-to-r from-gray-900 via-gray-700 to-black rounded-t-lg z-20"></div>

      {/* Valve Body (Brass/Metal) */}
      <div className="absolute bottom-[350px] left-1/2 -translate-x-1/2 w-[50px] h-[60px] z-20">
         {/* Main block */}
         <div className="w-full h-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-800 rounded-md border border-yellow-900/50 shadow-lg"></div>
         
         {/* Nozzle/Hose Connector (Left Side) */}
         <div className="absolute top-4 -left-4 w-6 h-6 bg-black rounded-full shadow-inner"></div>
      </div>

      {/* --- HOSE --- */}
      {/* 
         ANIMATED HOSE:
         When aiming/squeezing, rotate to point nozzle up/right towards center screen (where fire is).
      */}
      <div 
        className="absolute bottom-[100px] left-[-40px] w-[140px] h-[300px] z-30 transition-transform duration-500 ease-out"
        style={{
           transformOrigin: '85px 20px', // Near the connection point to valve
           // -75deg rotates it up and inwards enough to point at the fire visual center
           transform: isAimingOrFiring ? 'rotate(-75deg) translate(-10px, -5px)' : 'rotate(0deg)'
        }}
      >
          <svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="none" className="drop-shadow-xl">
             <path 
               d="M 85 20 Q 20 50 10 200" 
               fill="none" 
               stroke="#1a1a1a" 
               strokeWidth="12" 
               strokeLinecap="round"
             />
             <path 
               d="M 85 20 Q 20 50 10 200" 
               fill="none" 
               stroke="#333" 
               strokeWidth="4" 
               strokeLinecap="round"
               className="opacity-50"
             />
          </svg>
          {/* Nozzle Tip */}
          <div className="absolute bottom-0 left-[0px] w-8 h-12 bg-black rounded-sm border-t border-gray-700"></div>
      </div>


      {/* --- HANDLES --- */}
      
      {/* Bottom Handle (Fixed) */}
      <div className="absolute bottom-[360px] left-[60%] w-[90px] h-[12px] bg-black rounded-full transform rotate-[-10deg] z-10 shadow-lg border-b border-gray-700"></div>

      {/* Top Handle (Trigger) - Animates on Squeeze */}
      <div 
        className="absolute bottom-[390px] left-[60%] w-[90px] h-[12px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-full transform origin-left z-20 transition-transform duration-100 shadow-md border border-gray-400"
        style={{ transform: isSqueezing ? 'rotate(5deg) translateY(10px)' : 'rotate(-15deg)' }}
      ></div>


      {/* --- GAUGE (Interactive for Inspect Step) --- */}
      <div className={`absolute bottom-[365px] left-[45px] w-[36px] h-[36px] bg-gray-200 rounded-full border-2 border-gray-400 z-30 shadow-md ${isInspect ? 'animate-pulse' : ''}`}>
         <div className="absolute inset-[2px] bg-white rounded-full overflow-hidden">
             {/* Green Zone */}
             <div className="absolute top-0 right-0 w-full h-full bg-green-500 opacity-20" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0)' }}></div>
             {/* Needle */}
             <div className="absolute top-1/2 left-1/2 w-[1px] h-[14px] bg-red-600 origin-bottom transform -translate-x-1/2 -translate-y-full rotate-[10deg]"></div>
             {/* Center Dot */}
             <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
         </div>
         {/* Glass reflection */}
         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent rounded-full pointer-events-none"></div>
      </div>


      {/* --- SAFETY PIN (Interactive for Pull Step) --- */}
      <div 
        className={`absolute bottom-[365px] left-[85px] z-20 transition-all duration-500 ${isPinPulled ? 'opacity-0 translate-x-20' : 'opacity-100'}`}
      >
         <div className={`relative ${isPull ? 'animate-pulse' : ''}`}>
             {/* Ring */}
             <div className="w-8 h-8 rounded-full border-4 border-gray-300 shadow-sm"></div>
             {/* Pin shaft */}
             <div className="absolute top-1/2 right-full w-10 h-1 bg-gray-300"></div>
         </div>
      </div>

    </div>
  );
};

export default ExtinguisherModel;
