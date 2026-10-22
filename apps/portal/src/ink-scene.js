(() => {
  const canvases = Array.from(document.querySelectorAll('[data-ink-scene]'));
  if (!canvases.length) return;

  const paint = (canvas) => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const w = bounds.width;
    const h = bounds.height;
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, w * 0.82, h);
    sky.addColorStop(0, 'rgba(166, 187, 217, .76)');
    sky.addColorStop(0.48, 'rgba(226, 224, 238, .38)');
    sky.addColorStop(1, 'rgba(220, 178, 198, .44)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const ridge = (points, color, alpha) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(points[0][0] * w, points[0][1] * h);
      for (let i = 1; i < points.length; i += 1) {
        const [px, py] = points[i - 1];
        const [x, y] = points[i];
        const mx = (px + x) * 0.5 * w;
        const my = (py + y) * 0.5 * h;
        ctx.quadraticCurveTo(px * w, py * h, mx, my);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last[0] * w, last[1] * h);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    ridge([[0, .58], [.12, .43], [.2, .49], [.34, .3], [.43, .45], [.55, .25], [.66, .47], [.78, .33], [.9, .48], [1, .36]], '#7385ad', 0.25);
    ridge([[0, .71], [.12, .57], [.24, .63], [.4, .45], [.5, .61], [.63, .42], [.73, .58], [.87, .43], [1, .62]], '#7c90b0', 0.34);
    ridge([[0, .83], [.14, .68], [.26, .78], [.4, .61], [.54, .76], [.67, .57], [.8, .73], [.92, .59], [1, .7]], '#638b91', 0.43);
    ridge([[0, .92], [.14, .79], [.3, .88], [.45, .72], [.59, .87], [.76, .69], [.88, .78], [1, .67]], '#486b76', 0.48);
    ridge([[0, .89], [.1, .8], [.19, .87], [.34, .76], [.43, .85], [.59, .78], [.7, .86], [.84, .68], [1, .73]], '#ac5b78', 0.28);

    let state = 93471;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let layer = 0; layer < 3; layer += 1) {
      const yBase = h * (0.67 + layer * 0.085);
      const count = Math.ceil(w / (layer === 0 ? 18 : 11));
      ctx.beginPath();
      for (let i = 0; i <= count; i += 1) {
        const x = (i / count) * w;
        const slope = Math.sin(i * 0.31 + layer) * h * 0.018;
        const y = yBase + slope + (random() - 0.5) * h * 0.009;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = layer === 2 ? 'rgba(53, 75, 92, .12)' : 'rgba(75, 91, 124, .1)';
      ctx.lineWidth = layer === 2 ? 1.2 : 0.8;
      ctx.stroke();
    }

    const mist = ctx.createLinearGradient(0, h * 0.56, 0, h * 0.91);
    mist.addColorStop(0, 'rgba(242, 241, 247, 0)');
    mist.addColorStop(0.48, 'rgba(242, 241, 247, .36)');
    mist.addColorStop(1, 'rgba(242, 241, 247, .08)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, h * 0.54, w, h * 0.42);
  };

  let scheduled = 0;
  const schedule = () => {
    window.cancelAnimationFrame(scheduled);
    scheduled = window.requestAnimationFrame(() => canvases.forEach(paint));
  };
  schedule();
  window.addEventListener('resize', schedule, { passive: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    canvases.forEach((canvas) => observer.observe(canvas));
  }
})();
