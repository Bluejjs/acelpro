# AcelPro — Landing Page

Sitio web estático (HTML + CSS + JS puro, sin frameworks ni dependencias de build) para el taller mecánico AcelPro, especializado en motores diésel/gasolina y tren delantero/trasero.

## Estructura del proyecto

```
acelpro-website/
├── index.html          → Página principal (única página)
├── css/
│   └── styles.css       → Todos los estilos del sitio
├── js/
│   └── main.js            → Navegación, scroll, menú mobile, formulario -> WhatsApp
├── assets/
│   ├── LEEME.txt            → Notas sobre imágenes (og-image, favicon)
│   └── distribucion-motor.jpg → Foto de fondo del hero
├── robots.txt            → Indicaciones para buscadores (Google, Bing)
├── sitemap.xml            → Mapa del sitio para Google Search Console
├── .htaccess               → Cabeceras de seguridad (hosting Apache/cPanel)
├── _headers                 → Cabeceras de seguridad (Netlify / Cloudflare Pages)
├── vercel.json                → Cabeceras de seguridad (Vercel)
└── README.md                    → Este archivo
```

No requiere `npm install`, build step, ni servidor backend. Es 100% archivos estáticos: se suben tal cual a cualquier hosting.

---

## Cómo publicarlo (elige tu hosting)

### Opción A — Hosting tradicional / cPanel (lo más común en Chile)
1. Entra al **Administrador de archivos** de tu hosting o conéctate por **FTP** (FileZilla, etc.).
2. Sube **todo el contenido de esta carpeta** (no la carpeta en sí, su contenido) dentro de `public_html/` o `www/`.
3. Verifica que `index.html` quede directamente en la raíz de `public_html/`.
4. Activa el certificado **SSL gratuito (Let's Encrypt)** desde el panel de hosting.
5. Una vez confirmado que el SSL funciona, abre `.htaccess` y descomenta el bloque de "Forzar HTTPS" (instrucciones dentro del archivo).

### Opción B — Netlify
1. Crea una cuenta en netlify.com.
2. Arrastra la carpeta completa a "Deploys" (drag & drop), o conecta tu repositorio Git.
3. El archivo `_headers` se aplica automáticamente — no necesitas configurar nada más.

### Opción C — Vercel
1. Crea una cuenta en vercel.com y conecta tu repositorio, o usa `vercel deploy` desde la carpeta.
2. El archivo `vercel.json` se aplica automáticamente.

### Opción D — GitHub Pages
1. Sube esta carpeta a un repositorio de GitHub.
2. Activa GitHub Pages en Settings → Pages, apuntando a la rama principal.
3. Nota: GitHub Pages no soporta `.htaccess`; las cabeceras de seguridad no aplicarán en este caso (usa Netlify o Vercel si esas cabeceras son prioritarias).

---

## Checklist antes de publicar (importante)

- [ ] Reemplazar `https://www.acelpro.cl/` por tu dominio real en: `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` y `sitemap.xml`.
- [ ] Subir una foto real del taller (1200×630px) a `assets/og-image.jpg` y actualizar la referencia en `index.html`.
- [ ] Reemplazar el favicon de ejemplo por tu logo real.
- [ ] Verificar la dirección y horario en la sección de contacto (actualmente: Diego Portales 1167, La Florida, Santiago).
- [ ] Crear/reclamar la ficha de **Google Business Profile** con estos mismos datos — es el factor más importante para aparecer en el mapa local de Google.
- [ ] Verificar el dominio en **Google Search Console** y enviar el `sitemap.xml`.

---

## Auditoría de seguridad realizada

El sitio es **estático** (sin base de datos, sin login, sin backend propio), por lo que la superficie de ataque es baja. Aun así, se revisaron y corrigieron los siguientes puntos:

| # | Hallazgo | Riesgo | Solución aplicada |
|---|---|---|---|
| 1 | El formulario armaba el link de WhatsApp concatenando el texto del usuario sin codificar | Un carácter como `&` o `%` podía romper la URL o alterar los parámetros enviados | Se usa `encodeURIComponent()` sobre cada campo antes de construir la URL, en `js/main.js` |
| 2 | Enlaces externos (`target="_blank"`) solo tenían `rel="noopener"` | La pestaña abierta podía, en teoría, acceder a `window.opener` de la página original y leer el referer completo | Se agregó `rel="noopener noreferrer"` en todos los enlaces externos |
| 3 | Sin política de Content-Security-Policy | Si en el futuro se inyecta un script malicioso (ej. a través de un plugin de terceros mal configurado), no había ninguna barrera | Se agregó una meta-etiqueta CSP que solo permite recursos desde el propio dominio, Google Fonts y Google Maps |
| 4 | Sin cabeceras `X-Frame-Options` / `X-Content-Type-Options` | El sitio podía ser embebido dentro de un `<iframe>` de otro sitio (clickjacking) | Agregadas vía `.htaccess`, `_headers` y `vercel.json` según el hosting que uses |
| 5 | Sin `Referrer-Policy` | Se enviaba la URL completa (incluyendo posibles parámetros) como referer a sitios externos | Se configuró `strict-origin-when-cross-origin` |
| 6 | Listado de directorios habilitado por defecto en Apache | Un visitante podía ver la lista de archivos del servidor si no existe `index.html` en una carpeta | `Options -Indexes` en `.htaccess` |
| 7 | Sin forzado de HTTPS | El sitio podía cargar por `http://` sin cifrado | Regla de redirección a HTTPS incluida en `.htaccess` (queda comentada — actívala cuando tengas el SSL activo) |
| 8 | Formulario sin backend propio | — | Confirmado: no hay procesamiento server-side, por lo que no aplican riesgos de inyección SQL, subida de archivos maliciosos, etc. El formulario solo abre WhatsApp con el mensaje prellenado |

**No se encontraron:** manejadores de eventos inline (`onclick`, etc.), uso de `eval()`, inserción de datos de usuario vía `innerHTML`, enlaces `http://` inseguros, ni dependencias de terceros con código ejecutable fuera de Google Fonts (solo CSS) y el iframe de Google Maps (solo lectura).

### Lo que debes hacer tú (no depende del código)
- Activar el **certificado SSL** en tu hosting (gratis en la mayoría, vía Let's Encrypt).
- Si usas Apache/cPanel, descomentar el bloque HTTPS y `HSTS` en `.htaccess` una vez el SSL esté activo.
- Si más adelante agregas un formulario con backend propio (en vez de redirigir a WhatsApp), habrá que revisar validación server-side, protección CSRF y límites de tasa — avísame cuando llegue ese momento.

---

## Sobre el hero con imagen de fondo

La portada usa `assets/distribucion-motor.jpg` como fondo a pantalla completa (sistema de distribución del motor), con un degradado oscuro superpuesto para que el texto blanco/amarillo siempre sea legible sobre cualquier zona de la foto. Si quieres cambiar la imagen, solo reemplaza ese archivo por otro del mismo nombre (ideal: mínimo 1600px de ancho, formato horizontal, para que se vea nítida en pantallas grandes).

---

## Responsive: qué se revisó y qué se corrigió

El sitio se probó a nivel de código en los rangos de ancho típicos de cada tipo de dispositivo:

| Rango | Dispositivo típico |
|---|---|
| 320–480px | Teléfonos (iPhone SE a iPhone Pro Max, gama Android chica) |
| 481–767px | Teléfonos grandes en horizontal, phablets |
| 768–1024px | Tablets (iPad, Android tablets) |
| 1025–1440px | Notebooks y laptops |
| 1441px+ | Monitores de escritorio grandes |

**Bug encontrado y corregido:** el header se desbordaba en teléfonos. Al agregar el ícono de ubicación junto al logo, el conjunto logo + ubicación + botón "Agendar diagnóstico" + menú hamburguesa ya no cabía en pantallas angostas (~398px de contenido en una pantalla de 360px). Se corrigió ocultando el botón "Agendar diagnóstico" del header en móviles (≤860px) y agregando una versión de ese mismo botón, con el mismo destino, dentro del menú desplegable — así no se pierde la llamada a la acción, solo cambia de lugar.

**Otras mejoras aplicadas:**
- Resguardo global `overflow-x:hidden` en `html`/`body` para evitar cualquier scroll horizontal accidental en cualquier dispositivo.
- El ícono de ubicación en el header ahora tiene un área táctil de 40×40px en móvil (antes era muy pequeño para tocar cómodamente con el dedo).
- La franja de confianza (garantías, diagnóstico, etc.) pasa a una sola columna en teléfonos angostos (≤480px) en vez de dos columnas apretadas, para que el texto no quede cortado en líneas muy angostas.
- Los botones del hero (Agendar diagnóstico / WhatsApp) se apilan a ancho completo en pantallas ≤480px para que sean más fáciles de tocar.
- Se eliminó código muerto (motor 3D animado y gráfico de rendimiento, que ya no están en el HTML) — esto reduce el peso de la página, lo que ayuda especialmente en conexiones móviles más lentas.

**Secciones que ya estaban bien resueltas** (grilla de servicios, "por qué elegirnos", formulario de contacto, footer) tienen sus propios puntos de quiebre (`960px`, `900px`, `800px`, `520px` según la sección) y no necesitaron cambios.

> Nota técnica: en este entorno no fue posible tomar capturas de pantalla reales con navegador (la instalación de Chromium headless está bloqueada por la red restringida del entorno), así que la revisión se hizo a nivel de código: midiendo anchos de contenido contra cada punto de quiebre. Si quieres una verificación 100% visual, puedes abrir `index.html` en Chrome y usar el modo de diseño responsivo (F12 → ícono de celular/tablet) para recorrer los tamaños de la tabla de arriba.
