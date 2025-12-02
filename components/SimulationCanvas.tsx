
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
        this.x = w / 2 + (Math.random() - 0.5) * 150;
        this.y = h / 2 - 50 + (Math.random() * 50); 
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 6 - 2;
        this.life = 1.0;
        this.size = Math.random() * 30 + 20;
        this.baseColor = Math.random() * 40 + 10; // Orange/Yellow
        this.color = `hsla(${this.baseColor}, 100%, 50%,`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.1; 
        this.life -= 0.025;
        this.size -= 0.5;
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
        // Start from the nozzle position of the 3D model
        // The model is centered, nozzle is roughly at center-right
        // We simulate the nozzle moving with aimX
        const nozzleBaseX = w / 2 + (aimFactor * 50) + 40; 
        const nozzleBaseY = h / 2 + 100; 

        this.x = nozzleBaseX;
        this.y = nozzleBaseY;
        
        // Target is the fire base
        const targetX = w / 2 + (Math.random() - 0.5) * 50; 
        const targetY = h / 2 - 20; // Fire base

        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        const force = 18 + Math.random() * 4;

        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        
        this.gravity = 0.2;
        this.life = 1.0;
        this.size = Math.random() * 8 + 5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= 0.02;
        this.size += 0.5;
        
        // Floor collision
        if (this.y > canvas.height / 2 + 50) {
            this.vy *= -0.5;
            this.vx *= 0.8;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.globalAlpha = this.life * 0.8;
        c.fillStyle = '#E0F2FE'; 
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1.0;
      }
    }

    let fireParticles: FireParticle[] = [];
    let foamParticles: FoamParticle[] = [];
    let animationId: number;
    let localFireHealth = 100;

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
      if (isSqueezing && localFireHealth > 0) {
        for (let i = 0; i < 5; i++) {
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

      // 4. Draw Foam & Check Collision
      let hitCount = 0;
      const fireCenterX = canvas.width / 2;
      const fireCenterY = canvas.height / 2; // Approximate fire core

      for (let i = foamParticles.length - 1; i >= 0; i--) {
        const p = foamParticles[i];
        p.update();
        p.draw(ctx);
        
        // Simple circular collision with fire center area
        const dist = Math.hypot(p.x - fireCenterX, p.y - fireCenterY);
        if (dist < 80 && p.life > 0.5) {
            hitCount++;
        }

        if (p.life <= 0) foamParticles.splice(i, 1);
      }

      // 5. Logic
      // Only effective if aiming near center (where fire is)
      const isAimingAtFire = Math.abs(aimX) < 0.3; 
      
      if (hitCount > 0 && isSqueezing && isAimingAtFire) {
         localFireHealth -= 0.5; 
         if (localFireHealth < 0) localFireHealth = 0;
         setFireHealth(localFireHealth);
      } else if (localFireHealth < 100 && localFireHealth > 0 && !isSqueezing) {
         // Fire grows back slowly if you stop
         localFireHealth += 0.1;
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
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 bg-black/60 rounded-full h-3 border border-white/20 backdrop-blur-sm overflow-hidden z-20">
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
