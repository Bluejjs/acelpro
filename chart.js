/*!
 * AcelPro — chart.js
 * Gráfico interactivo "Rendimiento del motor": compara el rendimiento
 * estimado antes y después de una mantención en AcelPro, en función
 * de las revoluciones por motor (RPM). Curvas dibujadas con SVG puro,
 * sin librerías externas.
 *
 * Nota: los valores son ilustrativos (curva de referencia tipo dinamómetro)
 * y buscan comunicar la mejora relativa de rendimiento, no una medición
 * real de un vehículo específico.
 */
(function () {
  'use strict';

  const svg = document.getElementById('perfSvg');
  if (!svg) return;

  // ---- Datos de referencia (RPM, % de rendimiento relativo) ----
  const antesData = [
    { rpm: 600, val: 18 },
    { rpm: 1600, val: 42 },
    { rpm: 2600, val: 60 },
    { rpm: 3600, val: 70 },
    { rpm: 4600, val: 64 },
    { rpm: 5600, val: 50 },
    { rpm: 6400, val: 36 }
  ];
  const despuesData = [
    { rpm: 600, val: 28 },
    { rpm: 1600, val: 58 },
    { rpm: 2600, val: 82 },
    { rpm: 3600, val: 97 },
    { rpm: 4600, val: 92 },
    { rpm: 5600, val: 78 },
    { rpm: 6400, val: 58 }
  ];

  // ---- Sistema de coordenadas del viewBox (380 x 172) ----
  const PAD_L = 30, PAD_R = 360, PAD_T = 20, PAD_B = 140;
  const RPM_MIN = 500, RPM_MAX = 6500;

  const xForRpm = (rpm) => PAD_L + ((rpm - RPM_MIN) / (RPM_MAX - RPM_MIN)) * (PAD_R - PAD_L);
  const yForVal = (val) => PAD_B - (val / 100) * (PAD_B - PAD_T);

  // ---- Curva suave (Catmull-Rom -> Bézier) ----
  function smoothPath(points) {
    const pts = points.map((p) => [xForRpm(p.rpm), yForVal(p.val)]);
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  const pathAntes = document.getElementById('perfPathAntes');
  const pathDespues = document.getElementById('perfPathDespues');
  pathAntes.setAttribute('d', smoothPath(antesData));
  pathDespues.setAttribute('d', smoothPath(despuesData));

  // ---- Líneas guía verticales (ticks de RPM) ----
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const gridWrap = document.getElementById('perfGridlines');
  [1000, 2000, 3000, 4000, 5000, 6000].forEach((rpm) => {
    const x = xForRpm(rpm);

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x);
    line.setAttribute('x2', x);
    line.setAttribute('y1', PAD_T);
    line.setAttribute('y2', PAD_B);
    line.setAttribute('class', 'perf-grid-tick');
    gridWrap.appendChild(line);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', PAD_B + 14);
    label.setAttribute('class', 'perf-grid-label');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = rpm / 1000 + 'k';
    gridWrap.appendChild(label);
  });

  // ---- Animación de dibujo (stroke-dashoffset) ----
  [pathAntes, pathDespues].forEach((path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    pathAntes.style.strokeDashoffset = '0';
    pathDespues.style.strokeDashoffset = '0';
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pathAntes.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,.84,.44,1)';
        pathDespues.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,.84,.44,1) .25s';
        pathAntes.style.strokeDashoffset = '0';
        pathDespues.style.strokeDashoffset = '0';
      });
    });
  }

  // ---- Badge "+XX% rendimiento" con conteo animado ----
  const peakAntes = Math.max(...antesData.map((p) => p.val));
  const peakDespues = Math.max(...despuesData.map((p) => p.val));
  const improvement = Math.round(((peakDespues - peakAntes) / peakAntes) * 100);
  const badgeValue = document.getElementById('perfBadgeValue');

  if (badgeValue) {
    if (prefersReducedMotion) {
      badgeValue.textContent = '+' + improvement + '%';
    } else {
      let start = null;
      const duration = 1200;
      function animateBadge(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        badgeValue.textContent = '+' + Math.round(eased * improvement) + '%';
        if (progress < 1) requestAnimationFrame(animateBadge);
      }
      requestAnimationFrame(animateBadge);
    }
  }

  // ---- Botones de filtro: Antes / Comparar / Después ----
  const toggleBtns = document.querySelectorAll('.perf-toggle-btn');
  const legendItems = document.querySelectorAll('.perf-legend-item');

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const view = btn.dataset.view;

      const showAntes = view === 'antes' || view === 'ambos';
      const showDespues = view === 'despues' || view === 'ambos';

      pathAntes.style.opacity = showAntes ? '1' : '0.08';
      pathDespues.style.opacity = showDespues ? '1' : '0.08';
      if (legendItems[0]) legendItems[0].style.opacity = showAntes ? '1' : '.35';
      if (legendItems[1]) legendItems[1].style.opacity = showDespues ? '1' : '.35';
    });
  });

  // ---- Interacción: línea guía + puntos + tooltip al pasar el mouse/dedo ----
  const capture = document.getElementById('perfHoverCapture');
  const hoverLine = document.getElementById('perfHoverLine');
  const dotAntes = document.getElementById('perfDotAntes');
  const dotDespues = document.getElementById('perfDotDespues');
  const tooltip = document.getElementById('perfTooltip');

  function nearestPoint(data, rpm) {
    return data.reduce((a, b) => (Math.abs(b.rpm - rpm) < Math.abs(a.rpm - rpm) ? b : a));
  }

  function isVisible(el) {
    return el.style.opacity !== '0.08';
  }

  function handleMove(clientX) {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const scaleX = 380 / rect.width;
    const svgX = (clientX - rect.left) * scaleX;
    const rpmRaw = RPM_MIN + ((svgX - PAD_L) / (PAD_R - PAD_L)) * (RPM_MAX - RPM_MIN);
    const rpm = Math.max(RPM_MIN, Math.min(RPM_MAX, rpmRaw));

    const pA = nearestPoint(antesData, rpm);
    const pD = nearestPoint(despuesData, rpm);
    const x = xForRpm(pA.rpm);

    hoverLine.setAttribute('x1', x);
    hoverLine.setAttribute('x2', x);
    hoverLine.setAttribute('opacity', '1');

    dotAntes.setAttribute('cx', x);
    dotAntes.setAttribute('cy', yForVal(pA.val));
    dotAntes.setAttribute('opacity', isVisible(pathAntes) ? '1' : '0');

    dotDespues.setAttribute('cx', x);
    dotDespues.setAttribute('cy', yForVal(pD.val));
    dotDespues.setAttribute('opacity', isVisible(pathDespues) ? '1' : '0');

    if (tooltip) {
      const rpmLabel = pA.rpm.toLocaleString('es-CL');
      tooltip.innerHTML =
        `<strong>${rpmLabel} RPM</strong><br>Antes: ${pA.val}% · Después: ${pD.val}%`;
      tooltip.style.opacity = '1';
      tooltip.style.left = (x / 380) * 100 + '%';
    }
  }

  function hideHover() {
    hoverLine.setAttribute('opacity', '0');
    dotAntes.setAttribute('opacity', '0');
    dotDespues.setAttribute('opacity', '0');
    if (tooltip) tooltip.style.opacity = '0';
  }

  if (capture) {
    capture.addEventListener('mousemove', (e) => handleMove(e.clientX));
    capture.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
      },
      { passive: true }
    );
    capture.addEventListener('mouseleave', hideHover);
    capture.addEventListener('touchend', hideHover);
  }
})();
