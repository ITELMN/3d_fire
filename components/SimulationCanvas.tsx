
import React, { useRef, useEffect, useState } from 'react';
import { SimulationStep } from '../types';

interface SimulationCanvasProps {
  step: SimulationStep;
  isSqueezing: boolean;
  aimX: number; // -1 to 1 (relative to center)
  onExtinguished: () => void;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ 
  step, 
  isSqueezing, 
  aimX,
  onExtinguished 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fireHealth, setFireHealth] = useState(100);
  const lastHitTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle Classes
    class FireParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      color: string;
      baseColor: number;

      constructor(w: number, h: number) {
        // Fire located slightly higher up visually to be "behind" the extinguisher
        // Spread it out a bit for the "Sweep" mechanic
        this.x = w / 2 + (Math.random() - 0.5) * 150; 
        this.y = h / 2 - 120 + (Math.random() * 60); 
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -Math.random() * 8 - 4;
        this.life = 1.0;
        this.size = Math.random() * 40 + 20;
        this.baseColor = Math.random() * 40 + 10; // Orange/Yellow
        this.color = `hsla(${this.baseColor}, 100%, 50%,`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.2; 
        this.life -= 0.025;
        this.size -= 0.6;
      }

      draw(c: CanvasRenderingContext2D) {
        c.globalCompositeOperation = 'lighter'; 
        c.fillStyle = `${this.color} ${this.life})`;
        c.beginPath();
        c.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
        c.fill();
        c.globalCompositeOperation = 'source-over';
      }
    }

    class FoamParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      gravity: number;

      constructor(w: number, h: number, aimFactor: number) {
        // ALIGNMENT: 
        // Extinguisher Model Scale 0.6. 
        // Hose Pivot is roughly at center-left.
        // We simulate the nozzle tip moving in an arc based on aimFactor.
        
        // Base position (aim=0)
        const centerX = w / 2;
        const centerY = h / 2;
        
        // Model visual offset is translate(-50%, -40%)
        // The hose tip in the CSS model is roughly at:
        // X: Center - 60px (Left side)
        // Y: Center - 50px (Mid-upper)
        
        // Dynamic offset based on Aim
        // aim -1 (Left) -> Tip moves Left and Down
        // aim 1 (Right) -> Tip moves Right and Up
        
        const nozzleTipX = centerX - 60 + (aimFactor * 30);
        const nozzleTipY = centerY - 50 - (aimFactor * 10);

        this.x = nozzleTipX;
        this.y = nozzleTipY;
        
        // Target calculation
        // Aiming directly affects the X target
        const targetX = w / 2 + (aimFactor * 400); // Wide sweep range
        const targetY = h / 2 - 80; // Fire base level

        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        // Add spread/spray randomness
        const spread = (Math.random() - 0.5) * 0.15; 
        
        const force = 25 + Math.random() * 8; 

        this.vx = Math.cos(angle + spread) * force;
        this.vy = Math.sin(angle + spread) * force;
        
        this.gravity = 0.25;
        this.life = 1.0;
        this.size = Math.random() * 12 + 8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= 0.02;
        this.size += 0.4;
        
        // Floor bounce
        if (this.y > canvas.height / 2 + 150) {
            this.vy *= -0.4;
            this.vx *= 0.6;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.globalAlpha = this.life * 0.8;
        c.fillStyle = '#f1f5f9'; 
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1.0;
      }
    }

    class SteamParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      color: string;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = -Math.random() * 5 - 2;
        this.life = 1.0;
        this.size = Math.random() * 30 + 10;
        // Sometimes gray steam, sometimes white
        this.color = Math.random() > 0.5 ? '#94a3b8' : '#cbd5e1';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.03;
        this.size += 1.5;
      }

      draw(c: CanvasRenderingContext2D) {
        c.globalAlpha = this.life * 0.3; 
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1.0;
      }
    }

    let fireParticles: FireParticle[] = [];
    let foamParticles: FoamParticle[] = [];
    let steamParticles: SteamParticle[] = [];
    let animationId: number;
    
    // Reset local health when step resets to Aim/Squeeze, but only if not Success
    let localFireHealth = step === SimulationStep.SUCCESS ? 0 : (step === SimulationStep.INTRO ? 100 : fireHealth);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Spawn Fire
      if (localFireHealth > 0 && step !== SimulationStep.SUCCESS) {
        const spawnRate = Math.floor((localFireHealth / 100) * 10) + 2;
        for (let i = 0; i < spawnRate; i++) {
          fireParticles.push(new FireParticle(canvas.width, canvas.height));
        }
      }

      // 2. Spawn Foam
      if (isSqueezing && step !== SimulationStep.SUCCESS) {
        for (let i = 0; i < 8; i++) {
          foamParticles.push(new FoamParticle(canvas.width, canvas.height, aimX));
        }
      }

      // 3. Draw Fire
      ctx.globalCompositeOperation = 'screen';
      for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) fireParticles.splice(i, 1);
      }
      ctx.globalCompositeOperation = 'source-over';

      // 4. Draw Steam (Background steam)
      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) steamParticles.splice(i, 1);
      }

      // 5. Draw Foam & Logic
      let hitFrame = false;
      const fireCenterX = canvas.width / 2;
      const fireCenterY = canvas.height / 2 - 80;

      for (let i = foamParticles.length - 1; i >= 0; i--) {
        const p = foamParticles[i];
        p.update();
        p.draw(ctx);
        
        // HIT DETECTION
        // Only hits if close to fire center AND fire still has health
        const dist = Math.hypot(p.x - fireCenterX, p.y - fireCenterY);
        
        // Hitbox radius: 100. If you aim too far left/right, particles won't be here.
        if (dist < 100 && p.life > 0.2 && localFireHealth > 0) {
            hitFrame = true;
            
            // Visual feedback: Steam
            if (Math.random() > 0.8) {
                steamParticles.push(new SteamParticle(p.x, p.y));
            }
            
            // Visual feedback: Kill foam particle (it hit something)
            p.life = 0; 
        }

        if (p.life <= 0) foamParticles.splice(i, 1);
      }

      // Game Logic
      if (isSqueezing && hitFrame) {
         localFireHealth -= 0.8; // Slow burn down
         if (localFireHealth < 0) localFireHealth = 0;
         setFireHealth(localFireHealth);
         
         // Trigger haptic occasionally on hit
         const now = Date.now();
         if (now - lastHitTime.current > 100) {
            // Using a callback to parent would be better, but this is fine for visual state
            lastHitTime.current = now;
         }
      } else if (localFireHealth < 100 && localFireHealth > 0 && !isSqueezing && step !== SimulationStep.SUCCESS) {
         // Regrow slowly
         localFireHealth += 0.2;
         setFireHealth(localFireHealth);
      }

      if (localFireHealth <= 0 && step !== SimulationStep.SUCCESS) {
         onExtinguished();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [step, isSqueezing, aimX, onExtinguished]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Health Bar */}
      {(step === SimulationStep.SQUEEZE || step === SimulationStep.SWEEP) && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 bg-slate-900/80 rounded-full h-4 border border-white/20 backdrop-blur-sm overflow-hidden z-20 transition-all duration-300">
           <div 
             className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,100,0,0.5)]"
             style={{ width: `${fireHealth}%` }}
           />
        </div>
      )}
    </div>
  );
};

export default SimulationCanvas;
