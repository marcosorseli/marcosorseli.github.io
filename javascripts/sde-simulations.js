// sde-simulations.js

// Simple Seeded Random Number Generator
function createSeededRandom(seed) {
  return function() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// 1. Ornstein-Uhlenbeck Mean Reversion
(function() {
  const canvas = document.getElementById('ouCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set the seed for the OU simulation
  const random = createSeededRandom(40);
  
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw center zero line
    const centerY = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = '#504945';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    const theta = 1.5, sigma = 1.0, T = 10, steps = 800;
    const dt = T / steps;
    const scaleX = canvas.width / steps;
    const scaleY = canvas.height / 10; 
    
    for (let p = 0; p < 10; p++) {
      let W = 0.0, ou_x = 0.0;
      const bmPath = [], ouPath = [];
      
      for (let i = 1; i <= steps; i++) {
        // Use our seeded random instead of Math.random()
        let u1 = random(), u2 = random();
        let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        let dW = Math.sqrt(dt) * z;
        
        W += dW;
        ou_x = ou_x - theta * ou_x * dt + sigma * dW;
        
        bmPath.push({x: i * scaleX, y: centerY - W * scaleY});
        ouPath.push({x: i * scaleX, y: centerY - ou_x * scaleY});
      }
      
      // Draw Brownian Motion (Gray, faint)
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      bmPath.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.strokeStyle = 'rgba(168, 153, 132, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Draw OU Process (Orange, prominent)
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ouPath.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.strokeStyle = 'rgba(214, 93, 14, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  window.addEventListener('resize', resize);
  resize();
})();

// 2. Brownian Bridge
(function() {
  const canvas = document.getElementById('bridgeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set the seed for the Bridge simulation
  const random = createSeededRandom(40);
  
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw center zero line
    const centerY = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = '#504945';
    ctx.stroke();
    
    const steps = 500;
    const dt = 1.0 / steps;
    const scaleX = canvas.width / steps;
    const scaleY = canvas.height / 3.5;
    
    for (let p = 0; p < 50; p++) {
      let W = [0];
      for (let i = 1; i <= steps; i++) {
        // Use our seeded random instead of Math.random()
        let u1 = random(), u2 = random();
        let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        W.push(W[i-1] + Math.sqrt(dt) * z);
      }
      
      let W_T = W[steps];
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      for (let i = 1; i <= steps; i++) {
        let t = i * dt;
        let bridge_val = W[i] - t * W_T;
        ctx.lineTo(i * scaleX, centerY - bridge_val * scaleY);
      }
      ctx.strokeStyle = 'rgba(214, 93, 14, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  window.addEventListener('resize', resize);
  resize();
})();