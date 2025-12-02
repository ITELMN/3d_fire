
import React, { useState } from 'react';
import { SimulationStep } from '../types';
import { Lock, Target, Fingerprint, Search, RefreshCw, MoveHorizontal } from 'lucide-react';

interface ControlsProps {
  step: SimulationStep;
  onAction: (action: string) => void;
  isSqueezing: boolean;
  setIsSqueezing: (s: boolean) => void;
  aimX: number;
  setAimX: (x: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  step, 
  onAction, 
  isSqueezing, 
  setIsSqueezing,
  aimX,
  setAimX
}) => {
  // HUD Instruction Component
  const Instruction = ({ text, sub, icon: Icon }: { text: string, sub: string, icon?: any }) => (
    <div className="absolute top-20 left-0 right-0 flex flex-col items-center pointer-events-none z-30 animate-in slide-in-from-top-4 duration-500">
       <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
          {Icon && <div className="p-2 bg-safety-red rounded-lg"><Icon size={20} className="text-white"/></div>}
          <div className="text-left">
             <div className="text-white font-black text-lg tracking-wide">{text}</div>
             <div className="text-slate-400 text-xs font-medium">{sub}</div>
          </div>
       </div>
    </div>
  );

  return (
    <>
      {/* STEP 1: INSPECT */}
      {step === SimulationStep.INSPECT && (
        <>
          <Instruction 
            text="步骤 1/4：检查压力" 
            sub="点击仪表盘确认指针在绿色区域" 
            icon={Search}
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
             <button 
               onClick={() => onAction('inspect_confirmed')}
               className="w-32 h-32 rounded-full border-2 border-dashed border-green-400/50 animate-pulse bg-green-500/10 flex items-center justify-center translate-y-24 -translate-x-12 active:scale-95 transition-transform"
             >
                <div className="bg-green-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">点击确认</div>
             </button>
          </div>
        </>
      )}

      {/* STEP 2: PULL */}
      {step === SimulationStep.PULL && (
        <>
          <Instruction 
            text="步骤 2/4：拔掉插销" 
            sub="点击金属环以解除保险" 
            icon={Lock}
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
             <button 
               onClick={() => onAction('pull_pin')}
               className="w-24 h-24 rounded-full border-2 border-dashed border-yellow-400/50 animate-pulse bg-yellow-400/10 flex items-center justify-center translate-y-24 translate-x-2 active:scale-95 transition-transform"
             >
                <div className="bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">点击拔销</div>
             </button>
          </div>
        </>
      )}

      {/* STEP 3: AIM */}
      {step === SimulationStep.AIM && (
        <>
          <Instruction 
            text="步骤 3/4：瞄准火源" 
            sub="拖动滑块将喷管对准火焰根部" 
            icon={Target}
          />
          
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
             {/* Aiming Reticle that moves opposite to aimX (simulating camera pan) or stays center? 
                 Let's keep it simple: A static reticle to show where the center (fire) is.
             */}
             <div className="w-20 h-20 border-2 border-red-500/50 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
             </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 px-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex flex-col gap-6">
             <div className="relative w-full h-16 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center px-2">
                 <MoveHorizontal className="absolute left-4 text-slate-500" size={20}/>
                 <MoveHorizontal className="absolute right-4 text-slate-500" size={20}/>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400 tracking-widest">左右滑动喷管</span>
                 </div>
                 <input 
                   type="range" 
                   min="-1" 
                   max="1" 
                   step="0.01"
                   value={aimX}
                   onChange={(e) => setAimX(parseFloat(e.target.value))}
                   className="w-full h-full opacity-0 absolute z-20 cursor-pointer"
                 />
                 <div 
                   className="w-12 h-12 bg-white rounded-xl shadow-[0_4px_0_#cbd5e1] active:shadow-none active:translate-y-[4px] transform transition-transform duration-75 pointer-events-none z-10 flex items-center justify-center border border-slate-200"
                   style={{ 
                     left: '50%', 
                     marginLeft: '-24px',
                     transform: `translateX(${aimX * 130}px)` 
                   }}
                 >
                   <div className="w-1.5 h-6 bg-slate-300 rounded-full"></div>
                 </div>
              </div>
              
              <button 
                 onClick={() => onAction('aim_confirmed')}
                 className="w-full bg-safety-red text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                确认已对准
              </button>
          </div>
        </>
      )}

      {/* STEP 4: SQUEEZE & SWEEP */}
      {(step === SimulationStep.SQUEEZE || step === SimulationStep.SWEEP) && (
        <>
          <Instruction 
            text={step === SimulationStep.SQUEEZE ? "步骤 4/4：按压喷射" : "保持扫射！"} 
            sub={step === SimulationStep.SQUEEZE ? "长按下方按钮并左右扫射灭火" : "左右移动直至火焰完全熄灭"} 
            icon={Fingerprint}
          />
          
          <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 px-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex flex-col gap-6">
            
            {/* Joystick for Aiming while Squeezing */}
            <div className="relative w-full h-14 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center px-2">
               <input 
                 type="range" 
                 min="-1" 
                 max="1" 
                 step="0.01"
                 value={aimX}
                 onChange={(e) => setAimX(parseFloat(e.target.value))}
                 className="w-full h-full opacity-0 absolute z-20 cursor-pointer"
               />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none gap-2">
                  <MoveHorizontal size={16} className="text-slate-500" />
                  <span className="text-xs text-slate-400 font-bold">左右瞄准</span>
               </div>
               <div 
                 className="w-10 h-10 bg-white rounded-full shadow-lg transform transition-transform duration-75 pointer-events-none z-10 flex items-center justify-center"
                 style={{ 
                   left: '50%', 
                   marginLeft: '-20px',
                   transform: `translateX(${aimX * 140}px)` 
                 }}
               >
                 <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
               </div>
            </div>

            {/* Fire Button */}
            <button
               onMouseDown={() => setIsSqueezing(true)}
               onMouseUp={() => setIsSqueezing(false)}
               onMouseLeave={() => setIsSqueezing(false)}
               onTouchStart={() => setIsSqueezing(true)}
               onTouchEnd={() => setIsSqueezing(false)}
               className={`w-full py-5 rounded-2xl font-black text-xl tracking-[0.2em] transition-all duration-100 flex items-center justify-center gap-3 select-none touch-none
                 ${isSqueezing 
                   ? 'bg-red-600 text-white scale-[0.98] shadow-inner ring-4 ring-red-900' 
                   : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-pulse'
                 }
               `}
            >
               {isSqueezing ? '正在喷射...' : '按压喷射'}
            </button>
          </div>
        </>
      )}

      {/* SUCCESS SCREEN */}
      {step === SimulationStep.SUCCESS && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in zoom-in duration-300 text-center p-6">
           <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-bounce">
              <RefreshCw className="text-white w-12 h-12" />
           </div>
           
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">灭火成功!</h1>
           <div className="h-1 w-20 bg-green-500 rounded-full mb-6"></div>
           
           <p className="text-slate-300 mb-8 max-w-xs text-lg">
             您已掌握 <span className="text-white font-bold">PASS</span> 灭火口诀
           </p>

           <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 uppercase font-bold">Step 1</div>
                <div className="font-bold text-white">提 (Inspect)</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 uppercase font-bold">Step 2</div>
                <div className="font-bold text-white">拔 (Pull)</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 uppercase font-bold">Step 3</div>
                <div className="font-bold text-white">握 (Aim)</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 uppercase font-bold">Step 4</div>
                <div className="font-bold text-white">压 (Squeeze)</div>
              </div>
           </div>
           
           <button 
             onClick={() => onAction('reset')}
             className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-xl"
           >
             重新开始训练
           </button>
        </div>
      )}
    </>
  );
};

export default Controls;
