/**
 * Hero Interactive 3D Cybernetic Constellation & Particle Wave
 * High performance, zero external dependencies, responsive with mouse magnetic interaction.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-interactive-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Particle configuration
  const PARTICLE_COUNT = window.innerWidth < 768 ? 45 : 90;
  const CONNECTION_DIST = window.innerWidth < 768 ? 95 : 130;
  const MOUSE_RADIUS = 160;

  let particles = [];
  let mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    isHovering: false,
  };

  // Color Palette
  const colors = [
    { r: 0, g: 245, b: 212 },   // Electric Cyan
    { r: 162, g: 89, b: 255 },  // Cyber Violet / Purple
    { r: 0, g: 187, b: 249 },   // Electric Azure
    { r: 247, g: 37, b: 133 },  // Neon Magenta
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.z = Math.random() * 0.8 + 0.2; // Depth factor (3D perspective)
      
      this.vx = (Math.random() - 0.5) * 0.7 * this.z;
      this.vy = (Math.random() - 0.5) * 0.7 * this.z;
      
      this.radius = (Math.random() * 2 + 1) * this.z;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseVal = Math.random() * Math.PI;
    }

    update() {
      // Gentle natural movement
      this.x += this.vx;
      this.y += this.vy;

      // Pulse alpha for breathing glow
      this.pulseVal += this.pulseSpeed;
      this.currentAlpha = this.alpha + Math.sin(this.pulseVal) * 0.2;

      // Magnetic Mouse Interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && mouse.isHovering) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        // Push particles slightly away while orbiting
        this.x -= Math.cos(angle) * force * 2.5 * this.z;
        this.y -= Math.sin(angle) * force * 2.5 * this.z;
      }

      // Screen Boundary wrapping
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }

    draw() {
      const renderRadius = this.radius * dpr;
      ctx.beginPath();
      ctx.arc(this.x * dpr, this.y * dpr, renderRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0.1, this.currentAlpha)})`;
      ctx.fill();

      // Soft glow for larger particles
      if (this.z > 0.6) {
        ctx.beginPath();
        ctx.arc(this.x * dpr, this.y * dpr, renderRadius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentAlpha * 0.25})`;
        ctx.fill();
      }
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 45 : 95;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connecting constellation lines
  function drawConnections() {
    const len = particles.length;
    for (let i = 0; i < len; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const factor = 1 - dist / CONNECTION_DIST;
          const lineAlpha = factor * 0.22 * Math.min(p1.alpha, p2.alpha);

          ctx.beginPath();
          ctx.moveTo(p1.x * dpr, p1.y * dpr);
          ctx.lineTo(p2.x * dpr, p2.y * dpr);

          // Blend colors
          const r = Math.round((p1.color.r + p2.color.r) / 2);
          const g = Math.round((p1.color.g + p2.color.g) / 2);
          const b = Math.round((p1.color.b + p2.color.b) / 2);

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
          ctx.lineWidth = factor * 1.2 * dpr;
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  let animationId;
  function render() {
    // Smooth lerp mouse towards target
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      if (!prefersReducedMotion) {
        particles[i].update();
      }
      particles[i].draw();
    }

    drawConnections();

    animationId = requestAnimationFrame(render);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    resize();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isHovering = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isHovering = false;
  });

  // Touch Support
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isHovering = true;
      }
    },
    { passive: true }
  );

  window.addEventListener('touchend', () => {
    mouse.isHovering = false;
  });

  // Initialize
  resize();
  render();
})();
