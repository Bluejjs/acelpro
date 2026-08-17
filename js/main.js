/*!
 * AcelPro — main.js
 * Interacciones del sitio: formulario -> WhatsApp, barra de progreso,
 * header compacto, scroll-spy, reveal-on-scroll y menú mobile.
 *
 * Nota de seguridad: todos los valores tomados de inputs del usuario se
 * codifican con encodeURIComponent antes de insertarse en una URL, para
 * evitar que caracteres especiales rompan el enlace o inyecten parámetros.
 */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '56984149003';

  /* ---------- Formulario de cotización -> WhatsApp ---------- */
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const vehiculo = document.getElementById('vehiculo').value.trim();
      const servicio = document.getElementById('servicio').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      // Límite defensivo de longitud (evita mensajes desproporcionados)
      const clip = (str, max) => str.length > max ? str.slice(0, max) : str;

      const lines = [
        'Hola, quiero solicitar una cotización:',
        `*Nombre:* ${clip(nombre, 120)}`,
        `*Teléfono:* ${clip(telefono, 40)}`,
        `*Vehículo:* ${clip(vehiculo, 120)}`,
        `*Servicio:* ${clip(servicio, 60)}`,
        `*Detalle:* ${mensaje ? clip(mensaje, 500) : 'Sin observaciones adicionales'}`
      ];

      // encodeURIComponent evita que "&", "#", "%", etc. rompan la URL
      // o se interpreten como parámetros adicionales.
      const text = encodeURIComponent(lines.join('\n'));
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---------- Barra de progreso de lectura ---------- */
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- Header que se compacta al bajar ---------- */
  const siteHeader = document.querySelector('header');
  function updateHeader() {
    if (!siteHeader) return;
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  /* ---------- Scroll-spy: resalta el link activo del menú ---------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  const spySections = ['servicios', 'porque', 'contacto']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateScrollSpy() {
    let currentId = null;
    const trigger = window.scrollY + window.innerHeight * 0.35;
    spySections.forEach((sec) => {
      if (sec.offsetTop <= trigger) currentId = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        updateScrollSpy();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Menú mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
    document.querySelectorAll('.nav-links a, .nav-cta').forEach((link) => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
