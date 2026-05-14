const canvas = document.querySelector('#particle-canvas');
const ctx = canvas.getContext('2d');
const typewriter = document.querySelector('#typewriter');
const orbWrap = document.querySelector('#orbWrap');
const orbMood = document.querySelector('#orbMood');
const soundToggle = document.querySelector('#soundToggle');
const easterEgg = document.querySelector('#easterEgg');
const anomaly = document.querySelector('#anomaly');
const surpriseBtn = document.querySelector('#surpriseBtn');
const bars = document.querySelector('#bars');

const phrase = 'Welcome back, Bintang.';
const metrics = {
  cpu: { value: document.querySelector('#cpuValue'), bar: document.querySelector('#cpuBar'), min: 24, max: 92 },
  sync: { value: document.querySelector('#syncValue'), bar: document.querySelector('#syncBar'), min: 71, max: 99 },
  quantum: { value: document.querySelector('#quantumValue'), bar: document.querySelector('#quantumBar'), min: 38, max: 89 },
  energy: { value: document.querySelector('#energyValue'), bar: document.querySelector('#energyBar'), min: 46, max: 96 },
};
const eggMessages = [
  'Hidden packet intercepted: BINTANG PRIME // access granted.',
  'Ghost key detected. The orb is now listening.',
  'Easter egg unlocked: press N + P together for a memory gate.',
  'Neural confetti deployed across the quantum bus.',
  'Secret codec awakened. Reality shimmer increased by 18%.'
];

let particles = [];
let soundEnabled = false;
let audioContext;
let heldKeys = new Set();
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  createParticles();
}

function createParticles() {
  const count = Math.min(115, Math.floor(window.innerWidth / 12));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 2.2 + 0.4,
    speedX: (Math.random() - 0.5) * 0.45,
    speedY: (Math.random() - 0.5) * 0.45,
    hue: Math.random() > 0.5 ? 185 : 306,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle, index) => {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.hypot(dx, dy);

    // Nearby particles subtly repel from the pointer to make the background feel alive.
    if (distance < 130) {
      particle.x -= dx * 0.006;
      particle.y -= dy * 0.006;
    }

    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    ctx.beginPath();
    ctx.fillStyle = `hsla(${particle.hue}, 100%, 65%, 0.72)`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = `hsla(${particle.hue}, 100%, 62%, 0.8)`;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const gap = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (gap < 112) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(36, 247, 255, ${0.11 - gap / 1300})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawParticles);
}

function runTypewriter(index = 0) {
  typewriter.textContent = phrase.slice(0, index);
  if (index <= phrase.length) {
    setTimeout(() => runTypewriter(index + 1), index < 9 ? 80 : 45);
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateMetrics() {
  Object.values(metrics).forEach((metric) => {
    const value = randomBetween(metric.min, metric.max);
    metric.value.textContent = `${value}%`;
    metric.bar.style.width = `${value}%`;
  });
}

function buildVisualizer() {
  for (let index = 0; index < 34; index += 1) {
    const bar = document.createElement('span');
    bar.className = 'bar';
    bar.style.height = `${randomBetween(18, 94)}%`;
    bars.appendChild(bar);
  }
}

function animateVisualizer() {
  document.querySelectorAll('.bar').forEach((bar, index) => {
    const wave = Math.sin(Date.now() / 220 + index * 0.66) * 22;
    const jitter = randomBetween(0, soundEnabled ? 48 : 28);
    bar.style.height = `${Math.max(9, 42 + wave + jitter)}%`;
  });
}

function initAudio() {
  audioContext ||= new AudioContext();
}

function playTone(frequency = 220, duration = 0.08, type = 'sine') {
  if (!soundEnabled) return;
  initAudio();

  // Tiny Web Audio tones provide optional subtle UI feedback without requiring audio files.
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.02);
}

function showEgg(message) {
  easterEgg.textContent = message;
  easterEgg.classList.add('show');
  playTone(randomBetween(260, 620), 0.12, 'triangle');
  clearTimeout(showEgg.timeout);
  showEgg.timeout = setTimeout(() => easterEgg.classList.remove('show'), 2800);
}

function triggerAnomaly() {
  document.body.classList.add('anomaly-mode');
  anomaly.classList.add('active');
  orbMood.textContent = 'Awestruck';
  playTone(110, 0.22, 'sawtooth');
  setTimeout(() => playTone(440, 0.18, 'triangle'), 140);
  setTimeout(() => playTone(880, 0.18, 'sine'), 280);
  setTimeout(() => {
    anomaly.classList.remove('active');
    document.body.classList.remove('anomaly-mode');
    orbMood.textContent = 'Curious';
  }, 3100);
}

window.addEventListener('pointermove', (event) => {
  mouse = { x: event.clientX, y: event.clientY };

  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;
  orbWrap.style.setProperty('--orb-x', x.toFixed(3));
  orbWrap.style.setProperty('--orb-y', y.toFixed(3));
  orbMood.textContent = Math.abs(x) + Math.abs(y) > 0.95 ? 'Tracking' : 'Curious';
});

document.querySelectorAll('.glass-panel').forEach((panel) => {
  panel.addEventListener('pointermove', (event) => {
    const rect = panel.getBoundingClientRect();
    panel.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    panel.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
});

document.querySelectorAll('.magnetic').forEach((item) => {
  item.addEventListener('pointermove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.04}px, ${y * 0.04}px)`;
  });
  item.addEventListener('pointerleave', () => {
    item.style.transform = '';
  });
});

soundToggle.addEventListener('click', async () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  if (soundEnabled) {
    initAudio();
    if (audioContext.state === 'suspended') await audioContext.resume();
    playTone(520, 0.12, 'triangle');
  }
});

surpriseBtn.addEventListener('click', triggerAnomaly);
bars.addEventListener('click', () => {
  showEgg('Visualizer imprint captured. Spectrum intensity boosted.');
  playTone(740, 0.12, 'square');
});

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  heldKeys.add(event.key.toLowerCase());

  if (heldKeys.has('n') && heldKeys.has('p')) {
    triggerAnomaly();
    showEgg('NeuroPulse handshake complete. Memory gate synchronized.');
    return;
  }

  if (/^[a-z0-9]$/i.test(event.key) && Math.random() > 0.72) {
    showEgg(eggMessages[randomBetween(0, eggMessages.length - 1)]);
  }
});

document.addEventListener('keyup', (event) => heldKeys.delete(event.key.toLowerCase()));

document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a, .metric-card, .protocol-card');
  if (target) playTone(randomBetween(320, 760), 0.07, 'triangle');
});

resizeCanvas();
buildVisualizer();
runTypewriter();
updateMetrics();
drawParticles();
setInterval(updateMetrics, 1500);
setInterval(animateVisualizer, 150);
window.addEventListener('resize', resizeCanvas);
