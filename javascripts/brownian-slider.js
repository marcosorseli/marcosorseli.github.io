document.addEventListener("DOMContentLoaded", () => {
    
    // --- Shared Randomness Setup ---
    function seededRandom(seed) {
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    // ==========================================
    // 1. The Static Random Walk (Canvas 1)
    // ==========================================
    const rwCanvas = document.getElementById('randomWalkCanvas');
    if (rwCanvas) {
        const ctxRW = rwCanvas.getContext('2d');
        const randomCoin = seededRandom(42); // Seed for the coin flip walk
        
        const rwSteps = 50;
        const walk = new Float32Array(rwSteps + 1);
        walk[0] = 0;
        let minVal = 0, maxVal = 0;
        
        for(let i = 0; i < rwSteps; i++) {
            const flip = randomCoin() > 0.5 ? 1 : -1;
            walk[i+1] = walk[i] + flip;
            if(walk[i+1] < minVal) minVal = walk[i+1];
            if(walk[i+1] > maxVal) maxVal = walk[i+1];
        }
        const rangeVal = maxVal - minVal;

        function drawRW() {
            const rect = rwCanvas.parentElement.getBoundingClientRect();
            rwCanvas.width = rect.width * window.devicePixelRatio;
            rwCanvas.height = rect.height * window.devicePixelRatio;
            ctxRW.scale(window.devicePixelRatio, window.devicePixelRatio);
            
            const w = rect.width, h = rect.height, pad = 15;
            const drawW = w - 2 * pad, drawH = h - 2 * pad;

            ctxRW.clearRect(0, 0, w, h);
            ctxRW.beginPath();
            ctxRW.strokeStyle = '#d65d0e'; // Gruvbox Orange
            ctxRW.lineWidth = 2.0; // Slightly thicker to emphasize the discrete steps
            
            for(let i = 0; i <= rwSteps; i++) {
                const x = pad + (i / rwSteps) * drawW;
                const y = pad + drawH - ((walk[i] - minVal) / Math.max(rangeVal, 0.001)) * drawH;
                if(i === 0) ctxRW.moveTo(x, y);
                else ctxRW.lineTo(x, y);
            }
            ctxRW.stroke();
        }
        
        drawRW();
        new ResizeObserver(drawRW).observe(rwCanvas.parentElement);
    }

    // ==========================================
    // 2. The Interactive Brownian Slider (Canvas 2)
    // ==========================================
    const canvas = document.getElementById('brownianCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const slider = document.getElementById('stepSlider');
        const countDisplay = document.getElementById('stepCount');
        const randomNorm = seededRandom(1337); // Seed for the continuous path

        const nValues = [2, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
        const maxN = 5000;
        
        const dW = new Float32Array(maxN);
        for(let i = 0; i < maxN; i++) {
            let u = 0, v = 0;
            while(u === 0) u = randomNorm();
            while(v === 0) v = randomNorm();
            dW[i] = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        }
        
        const W = new Float32Array(maxN + 1);
        W[0] = 0;
        for(let i = 0; i < maxN; i++) {
            W[i+1] = W[i] + dW[i] * Math.sqrt(1.0 / maxN);
        }

        let minW = 0, maxW = 0;
        for(let i = 0; i <= maxN; i++) {
            if(W[i] < minW) minW = W[i];
            if(W[i] > maxW) maxW = W[i];
        }
        const rangeW = maxW - minW;

        function draw(steps) {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            
            const width = rect.width;
            const height = rect.height;
            const padding = 15;
            const drawWidth = width - 2 * padding;
            const drawHeight = height - 2 * padding;

            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            ctx.strokeStyle = '#d65d0e'; 
            ctx.lineWidth = 1.5;
            
            const stepSize = maxN / steps;
            
            for(let i = 0; i <= steps; i++) {
                const index = Math.floor(i * stepSize);
                const x = padding + (i / steps) * drawWidth;
                const y = padding + drawHeight - ((W[index] - minW) / Math.max(rangeW, 0.001)) * drawHeight;
                
                if(i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        slider.addEventListener('input', (e) => {
            const N = nValues[e.target.value - 1];
            countDisplay.innerText = N;
            draw(N);
        });
        
        draw(nValues[slider.value - 1]);
        new ResizeObserver(() => draw(nValues[slider.value - 1])).observe(canvas.parentElement);
    }
});