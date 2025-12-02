
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
        this.x = w / 2 + (Math.random() - 0.5) * 120; 
        this.y = h / 2 - 80 + (Math.random() * 50); 
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 7 - 3;
        this.life = 1.0;
        this.size = Math.random() * 35 + 15;
        this.baseColor = Math.random() * 40 + 10; // Orange/Yellow
        this.color = `hsla(${this.baseColor}, 100%, 50%,`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.2; 
        this.life -= 0.02;
        this.size -= 0.4;
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
        // ALIGNED WITH EXTINGUISHER MODEL NOZZLE (Left Side)
        // Extinguisher Model is centered. 
        // Scale is approx 0.75.
        // Hose nozzle tip when lifted (Aim/Squeeze) is roughly:
        // x: Center - 100px (visually tuned for the new hose rotation)
        // y: Center + 20px
        
        const nozzleBaseX = w / 2 - 100 + (aimFactor * 20); 
        const nozzleBaseY = h / 2 + 20;

        this.x = nozzleBaseX;
        this.y = nozzleBaseY;
        
        // Target is the fire base + aim variance
        const targetX = w / 2 + (aimFactor * 200); 
        const targetY = h / 2 - 60; // Fire base

        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const force = 28 + Math.random() * 8; // Faster stream

        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        
        this.gravity = 0.25;
        this.life = 1.0;
        this.size = Math.random() * 12 + 8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= 0.015;
        this.size += 0.3;
        
        // Floor collision
        if (this.y > canvas.height / 2 + 100) {
            this.vy *= -0.5;
            this.vx *= 0.8;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.globalAlpha = this.life * 0.9;
        c.fillStyle = '#FFFFFF'; 
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

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -Math.random() * 4 - 2;
        this.life = 1.0;
        this.size = Math.random() * 30 + 15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.size += 1.5;
      }

      draw(c: CanvasRenderingContext2D) {
        c.globalAlpha = this.life * 0.3;
        c.fillStyle = '#cccccc'; // Lighter steam
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
    let localFireHealth = 100;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Spawn Fire
      if (localFireHealth > 0 && step !== SimulationStep.SUCCESS) {
        const spawnRate = Math.floor((localFireHealth / 100) * 12) + 2;
        for (let i = 0; i < spawnRate; i++) {
          fireParticles.push(new FireParticle(canvas.width, canvas.height));
        }
      }

      // 2. Spawn Foam (More density)
      if (isSqueezing && localFireHealth > 0) {
        for (let i = 0; i < 15; i++) {
          foamParticles.push(new FoamParticle(canvas.width, canvas.height, aimX));
        }
      }

      // 3. Draw Fire
      for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) fireParticles.splice(i, 1);
      }

      // 4. Draw Steam (from collisions)
      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const p = steamParticles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) steamParticles.splice(i, 1);
      }

      // 5. Draw Foam & Check Collision
      let hitCount = 0;
      const fireCenterX = canvas.width / 2;
      const fireCenterY = canvas.height / 2; // Approximate fire core

      for (let i = foamParticles.length - 1; i >= 0; i--) {
        const p = foamParticles[i];
        p.update();
        p.draw(ctx);
        
        // Collision with fire
        const dist = Math.hypot(p.x - fireCenterX, p.y - fireCenterY);
        // Hit logic: Must be close to fire center
        if (dist < 110 && p.life > 0.2) {
            hitCount++;
            // Spawn steam frequently on hit
            if (Math.random() > 0.6) {
                steamParticles.push(new SteamParticle(p.x, p.y));
            }
        }

        if (p.life <= 0) foamParticles.splice(i, 1);
      }

      // 6. Logic
      // Only effective if aiming near center (where fire is)
      const isAimingAtFire = Math.abs(aimX) < 0.45; // Slightly wider forgiving window
      
      if (hitCount > 0 && isSqueezing && isAimingAtFire) {
         localFireHealth -= 1.2; // Faster extinguishing if hitting
         if (localFireHealth < 0) localFireHealth = 0;
         setFireHealth(localFireHealth);
      } else if (localFireHealth < 100 && localFireHealth > 0 && !isSqueezing) {
         // Fire grows back slowly
         localFireHealth += 0.05;
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
      
      {/* Health Bar HUD */}
      {step !== SimulationStep.INTRO && step !== SimulationStep.SUCCESS && step !== SimulationStep.INSPECT && step !== SimulationStep.PULL && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 bg-black/60 rounded-full h-3 border border-white/20 backdrop-blur-sm overflow-hidden z-20 transition-opacity duration-300">
           <div 
             className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-200"
             style={{ width: `${fireHealth}%` }}
           />
        </div>
      )}
    </div>
  );
};

export default SimulationCanvas;
