/* ========== LOADER ========== */
window.addEventListener('load', () => {
  document.getElementById('loader').classList.add('hidden');
});

/* ========== PARTICLE SYSTEM ========== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.3 ? '255,106,0' : '79,195,247';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      this.x -= dx * 0.01;
      this.y -= dy * 0.01;
      this.opacity = Math.min(this.opacity + 0.02, 0.8);
    }
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
  }
}

const particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
for (let i = 0; i < particleCount; i++) particles.push(new Particle());

/* Spatial hashing for O(n) connection checks */
const CELL_SIZE = 100;
function drawConnections() {
  const grid = {};
  for (let i = 0; i < particles.length; i++) {
    const cx = Math.floor(particles[i].x / CELL_SIZE);
    const cy = Math.floor(particles[i].y / CELL_SIZE);
    const key = cx + ',' + cy;
    if (!grid[key]) grid[key] = [];
    grid[key].push(i);
  }
  for (let i = 0; i < particles.length; i++) {
    const cx = Math.floor(particles[i].x / CELL_SIZE);
    const cy = Math.floor(particles[i].y / CELL_SIZE);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = (cx + dx) + ',' + (cy + dy);
        const cell = grid[key];
        if (!cell) continue;
        for (let k = 0; k < cell.length; k++) {
          const j = cell[k];
          if (j <= i) continue;
          const px = particles[i].x - particles[j].x;
          const py = particles[i].y - particles[j].y;
          const dist = Math.sqrt(px * px + py * py);
          if (dist < CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,106,0,${0.06 * (1 - dist / CELL_SIZE)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========== TYPING EFFECT ========== */
const tagline = document.getElementById('tagline');
const text = 'I hunt bugs with AI-powered shadow clones. That is my ninja way.';
let charIndex = 0;

function typeText() {
  if (charIndex < text.length) {
    tagline.textContent += text.charAt(charIndex);
    charIndex++;
    setTimeout(typeText, 35 + Math.random() * 25);
  }
}
setTimeout(typeText, 1200);

/* ========== SCROLL REVEAL ========== */
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealElements.forEach(el => revealObserver.observe(el));

/* ========== SKILL BAR ANIMATION ========== */
const skillBars = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.level + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
skillBars.forEach(bar => skillObserver.observe(bar));

/* ========== COUNTER-UP ANIMATION ========== */
const counters = document.querySelectorAll('.counter-up');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (prefersReducedMotion) {
        el.textContent = target;
      } else {
        let current = 0;
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.round(eased * target);
          el.textContent = current;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

/* ========== NAVBAR ========== */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navAnchors.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

/* ========== ACTIVE SECTION HIGHLIGHT ========== */
const sections = document.querySelectorAll('section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => sectionObserver.observe(s));

/* ========== SMOOTH SCROLL FOR SAFARI ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
