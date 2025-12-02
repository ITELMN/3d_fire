import React, { useState, useEffect } from 'react';
import { SimulationStep } from './types';
import SimulationCanvas from './components/SimulationCanvas';
import Controls from './components/Controls';
import ExtinguisherModel from './components/ExtinguisherModel';
import ChatInterface from './components/ChatInterface';
import { Flame, Info, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<SimulationStep>(SimulationStep.INTRO);
  const [isSqueezing, setIsSqueezing] = useState(false);
  const [aimX, setAimX] = useState(0); // -1 (left) to 1 (right)
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // If squeezing for a while, move to sweep guidance
    if (step === SimulationStep.SQUEEZE && isSqueezing) {
      const timer = setTimeout(() => {
        setStep(SimulationStep.SWEEP);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, isSqueezing]);

  // Vibrate when squeezing
  useEffect(() => {
    let interval: any;
    if (isSqueezing && navigator.vibrate) {
       interval = setInterval(() => {
         navigator.vibrate(20);
       }, 100);
    }
    return () => clearInterval(interval);
  }, [isSqueezing]);

  const handleAction = (action: string) => {
    if (navigator.vibrate) navigator.vibrate(30);

    switch (action) {
      case 'start':
        setStep(SimulationStep.INSPECT);
        break;
      case 'inspect_confirmed':
        setStep(SimulationStep.PULL);
        break;
      case 'pull_pin':
        if (navigator.vibrate) navigator.vibrate(50);
        setStep(SimulationStep.AIM);
        break;
      case 'aim_confirmed':
        setStep(SimulationStep.SQUEEZE);
        break;
      case 'reset':
        setStep(SimulationStep.INTRO);
        setIsSqueezing(false);
        setAimX(0);
        break;
    }
  };

  const handleExtinguished = () => {
    setStep(SimulationStep.SUCCESS);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none text-white touch-none">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0" />
      
      {/* 1. Fire Simulation Layer (Background) */}
      <SimulationCanvas 
        step={step} 
        isSqueezing={isSqueezing} 
        aimX={aimX} 
        onExtinguished={handleExtinguished}
      />

      {/* 2. Realistic Extinguisher Object (Midground) */}
      {/* Visible in all active steps */}
      {(step !== SimulationStep.INTRO && step !== SimulationStep.SUCCESS) && (
        <ExtinguisherModel aimX={aimX} isSqueezing={isSqueezing} step={step} />
      )}

      {/* 3. UI Layer (Foreground) */}
      <div className="relative z-50 w-full h-full flex flex-col pointer-events-none">
        
        {/* Top Bar */}
        <div className="p-4 pt-safe flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-1">
             <div className="text-[10px] font-bold text-safety-orange uppercase tracking-widest border border-safety-orange/30 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm self-start">
               实战演练 V4.5
             </div>
             <div className="font-black text-xl text-white flex items-center gap-2 drop-shadow-md">
               <Flame className="text-red-500 fill-red-500 animate-pulse" /> 消防卫士
             </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleAction('reset')}
              className="p-3 bg-slate-800/80 backdrop-blur rounded-full text-slate-400 hover:text-white border border-slate-600 active:scale-95 transition-all"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="p-3 bg-red-600 rounded-full text-white shadow-lg active:scale-95 transition-all hover:bg-red-500"
            >
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* HUD Controls (Pass pointer events inside) */}
        <div className="flex-1 relative pointer-events-auto">
          <Controls 
            step={step} 
            onAction={handleAction} 
            isSqueezing={isSqueezing}
            setIsSqueezing={setIsSqueezing}
            aimX={aimX}
            setAimX={setAimX}
          />
        </div>

        {/* Intro Screen Overlay */}
        {step === SimulationStep.INTRO && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/90 backdrop-blur-md pointer-events-auto z-50">
            <div className="w-32 h-32 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-in zoom-in duration-500">
              <Flame size={64} className="text-white fill-white/20" />
            </div>
            <h1 className="text-4xl font-black mb-4 text-white tracking-tight">灭火器模拟训练</h1>
            <p className="text-slate-300 mb-10 max-w-sm leading-relaxed">
              通过高仿真 3D 互动，学习标准的 <br/>
              <span className="text-safety-orange font-bold">提 · 拔 · 握 · 压</span> (PASS) 灭火流程。
            </p>
            
            <button 
              onClick={() => handleAction('start')}
              className="w-full max-w-xs bg-white text-black font-black text-lg py-4 rounded-xl hover:bg-slate-200 transition-colors shadow-lg active:scale-95"
            >
              开始训练
            </button>
          </div>
        )}

      </div>

      {/* AI Chat Layer */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;