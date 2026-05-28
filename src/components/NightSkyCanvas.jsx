import { useEffect, useRef } from "react";

function NightSkyCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return undefined;
    }

    let width = 0;
    let height = 0;
    let frameId = 0;
    let stars = [];
    let shootingStars = [];
    let particles = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    class Star {
      constructor(layer) {
        this.layer = layer;
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * this.layer + 0.3;
        this.alpha = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.018 + 0.004;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.drift = Math.random() * 0.08 * this.layer;
      }

      update() {
        this.alpha += this.twinkleSpeed * this.direction;

        if (this.alpha >= 1) {
          this.alpha = 1;
          this.direction = -1;
        }

        if (this.alpha <= 0.15) {
          this.alpha = 0.15;
          this.direction = 1;
        }

        this.x += this.drift;

        if (this.x > width) {
          this.x = 0;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.shadowBlur = 10 * this.layer;
        ctx.shadowColor = "rgba(170, 190, 255, 0.9)";
        ctx.fill();
        ctx.restore();
      }
    }

    class NebulaParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 160 + 70;
        this.alpha = Math.random() * 0.08 + 0.025;
        this.speedX = Math.random() * 0.08 - 0.04;
        this.speedY = Math.random() * 0.04 - 0.02;

        const colors = [
          "rgba(125, 80, 255,",
          "rgba(60, 130, 255,",
          "rgba(190, 80, 255,",
          "rgba(80, 220, 255,",
        ];

        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < -this.radius) this.x = width + this.radius;
        if (this.x > width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = height + this.radius;
        if (this.y > height + this.radius) this.y = -this.radius;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `${this.color}${this.alpha})`);
        gradient.addColorStop(1, `${this.color}0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width * 0.7;
        this.y = Math.random() * height * 0.6;
        this.length = Math.random() * 180 + 140;
        this.speed = Math.random() * 12 + 10;
        this.size = Math.random() * 2.2 + 1.2;
        this.life = 0;
        this.maxLife = Math.random() * 35 + 35;
        this.active = true;
      }

      update() {
        this.x += this.speed;
        this.y += this.speed * 0.45;
        this.life += 1;

        if (this.life > this.maxLife || this.x > width + this.length || this.y > height) {
          this.active = false;
        }
      }

      draw() {
        const tailX = this.x - this.length;
        const tailY = this.y - this.length * 0.45;
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);

        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.15, "rgba(160, 220, 255, 0.95)");
        gradient.addColorStop(0.45, "rgba(150, 90, 255, 0.55)");
        gradient.addColorStop(1, "rgba(120, 80, 255, 0)");

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(160, 200, 255, 1)";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(190, 220, 255, 1)";
        ctx.fill();
        ctx.restore();
      }
    }

    const createStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 4200);

      for (let index = 0; index < starCount; index += 1) {
        const layer = Math.random() * 2.2 + 0.5;
        stars.push(new Star(layer));
      }
    };

    const createNebulaParticles = () => {
      particles = [];

      for (let index = 0; index < 18; index += 1) {
        particles.push(new NebulaParticle());
      }
    };

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#05001f");
      gradient.addColorStop(0.25, "#090636");
      gradient.addColorStop(0.55, "#07164a");
      gradient.addColorStop(0.8, "#120425");
      gradient.addColorStop(1, "#010106");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width * 0.5, height * 0.7, 0, width * 0.5, height * 0.7, width * 0.8);
      glow.addColorStop(0, "rgba(105, 65, 255, 0.22)");
      glow.addColorStop(0.4, "rgba(40, 120, 255, 0.11)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    };

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      createStars();
      createNebulaParticles();
      drawBackground();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawBackground();

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      if (Math.random() < 0.018) {
        shootingStars.push(new ShootingStar());
      }

      shootingStars.forEach((shootingStar) => {
        shootingStar.update();
        shootingStar.draw();
      });
      shootingStars = shootingStars.filter((shootingStar) => shootingStar.active);

      frameId = window.requestAnimationFrame(animate);
    };

    resizeCanvas();

    if (reduceMotion) {
      particles.forEach((particle) => particle.draw());
      stars.forEach((star) => star.draw());
    } else {
      animate();
    }

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="night-sky-canvas" aria-hidden="true" />;
}

export default NightSkyCanvas;
