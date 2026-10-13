import React, { useEffect, useRef } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    const starCount = 140;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      hue: Math.random() > 0.7 ? 45 : Math.random() > 0.4 ? 195 : 0, // gold, cyan, white
    }));

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      life: number;
      maxLife: number;
    }
    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          len: Math.random() * 90 + 70,
          speed: Math.random() * 10 + 12,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.25,
          life: 0,
          maxLife: 35,
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep space cosmic gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.85,
        height * 0.15,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#1c1032'); // Solar nebula purple
      bgGrad.addColorStop(0.3, '#0c0b24'); // Deep cosmic indigo
      bgGrad.addColorStop(0.7, '#040714'); // Abyss blue-black
      bgGrad.addColorStop(1, '#02030a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant radiant Sun / Solar Corona in top-right
      const sunX = width * 0.9;
      const sunY = height * 0.1;
      const sunRadius = 65;

      // Outer solar flare aura
      const sunAura = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.2, sunX, sunY, sunRadius * 4.5);
      sunAura.addColorStop(0, 'rgba(255, 200, 70, 0.45)');
      sunAura.addColorStop(0.25, 'rgba(255, 120, 30, 0.2)');
      sunAura.addColorStop(0.6, 'rgba(180, 50, 100, 0.08)');
      sunAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunAura;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      const sunCore = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      sunCore.addColorStop(0, '#ffffff');
      sunCore.addColorStop(0.2, '#fff2a3');
      sunCore.addColorStop(0.6, '#ff9922');
      sunCore.addColorStop(1, '#dd3300');
      ctx.fillStyle = sunCore;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Nebula dust glow in bottom left
      const nebGrad = ctx.createRadialGradient(width * 0.1, height * 0.85, 20, width * 0.2, height * 0.8, 380);
      nebGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)'); // cyan cosmic cloud
      nebGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.06)'); // violet dust
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(width * 0.15, height * 0.85, 380, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling stars
      for (const star of stars) {
        star.alpha += star.speed;
        const currentAlpha = Math.abs(Math.sin(star.alpha)) * 0.85 + 0.15;

        ctx.fillStyle =
          star.hue === 45
            ? `rgba(253, 224, 71, ${currentAlpha})`
            : star.hue === 195
            ? `rgba(125, 211, 252, ${currentAlpha})`
            : `rgba(255, 255, 255, ${currentAlpha})`;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        const tailX = s.x - Math.cos(s.angle) * s.len;
        const tailY = s.y - Math.sin(s.angle) * s.len;

        const fade = 1 - s.life / s.maxLife;
        if (fade <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const streakGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        streakGrad.addColorStop(0.7, `rgba(186, 230, 253, ${fade * 0.6})`);
        streakGrad.addColorStop(1, `rgba(255, 255, 255, ${fade})`);

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
    />
  );
};
