
import React, { useState } from 'react';
import { SimulationStep } from '../types';
import { Lock, Target, Fingerprint, Search, AlertCircle, RefreshCw } from 'lucide-react';

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
            text="第一步：检查压力" 
            sub="点击仪表盘确认指针在绿色区域" 
            icon={Search}
          />
          {/* Invisible Overlay for the 3D model interaction area */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
             {/* The button is positioned over where the gauge is in the zoomed 3D model */}
             <button 
               onClick={() => onAction('inspect_confirmed')}
               className="w-32 h-32 rounded-full border-2 border-dashed border-green-400/50 animate-pulse bg-green-500/10 flex items-center justify-center translate-y-24 -translate-x-12"
             >
                <div className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">点击确认</div>
             </button>
          </div>
        </>
      )}

      {/* STEP 2: PULL */}
      {step === SimulationStep.PULL && (
        <>
          <Instruction 
            text="第二步：拔掉插销" 
            sub="点击金属环以解除锁定" 
            icon={Lock}
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
             {/* Positioned over the pin on the zoomed 3D model */}
             <button 
               onClick={() => onAction('pull_pin')}
               className="w-24 h-24 rounded-full border-2 border-dashed border-yellow-400/50 animate-pulse bg-yellow-400/10 flex items-center justify-center translate-y-24 translate-x-2"
             >
                <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">点击拔销</div>
             </button>
          </div>
        </>
      )}

      {/* STEP 3: AIM */}
      {step === SimulationStep.AIM && (
        <>
          <Instruction 
            text="第三步：瞄准火源" 
            sub="拖动滑块调整喷射角度" 
            icon={Target}
          />
          <div className="absolute inset-0 z-20 pointer-events-none">
             {/* Visual helper for aiming */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-red-500/30 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
          </div>
          
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-30">
            <button 
               onClick={() => onAction('aim_confirmed')}
               className="bg-safety-red text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95"
            >
              已对准火焰根部
            </button>
          </div>
        </>
      )}

      {/* STEP 4: SQUEEZE & SWEEP */}
      {(step === SimulationStep.SQUEEZE || step === SimulationStep.SWEEP) && (
        <>
          <Instruction 
            text={step === SimulationStep.SQUEEZE ? "第四步：按压喷射" : "保持扫射"} 
            sub={step === SimulationStep.SQUEEZE ? "长按下方按钮并左右扫射" : "左右移动直至火焰熄灭"} 
            icon={Fingerprint}
          />
          
          {/* Controls Container */}
          <div className="absolute bottom-0 left-0 right-0 pb-10 pt-20 px-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex flex-col gap-6">
            
            {/* Slider / Joystick */}
            <div className="relative w-full h-14 bg-slate-800 rounded-2xl border border-slate-700 flex items-center px-2">
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold tracking-widest pointer-events-none">
                  左右滑动瞄准
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
                 className="w-10 h-10 bg-white rounded-xl shadow-lg transform transition-transform duration-75 pointer-events-none z-10 flex items-center justify-center"
                 style={{ 
                   left: '50%', 
                   marginLeft: '-20px',
                   transform: `translateX(${aimX * 140}px)` 
                 }}
               >
                 <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
               </div>
            </div>

            {/* Fire Button */}
            <button
               onMouseDown={() => setIsSqueezing(true)}
               onMouseUp={() => setIsSqueezing(false)}
               onTouchStart={() => setIsSqueezing(true)}
               onTouchEnd={() => setIsSqueezing(false)}
               className={`w-full py-5 rounded-2xl font-black text-xl tracking-widest transition-all duration-100 flex items-center justify-center gap-3 select-none touch-none
                 ${isSqueezing 
                   ? 'bg-red-600 text-white scale-[0.98] shadow-inner' 
                   : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
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
           <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              <RefreshCw className="text-white w-12 h-12" />
           </div>
           
           <h1 className="text-3xl font-black text-white mb-2">灭火成功!</h1>
           <p className="text-slate-400 mb-8 max-w-xs">
             您已完美掌握 PASS 灭火操作流程。
             <br/>1. 提 (Inspect)
             <br/>2. 拔 (Pull)
             <br/>3. 握 (Aim)
             <br/>4. 压 (Squeeze)
           </p>
           
           <button 
             onClick={() => onAction('reset')}
             className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
           >
             重新开始训练
           </button>
        </div>
      )}
    </>
  );
};

export default Controls;
