# AcelPro — Landing Page

Sitio web estático (HTML + CSS + JS puro, sin frameworks ni dependencias de build) para el taller mecánico AcelPro, especializado en motores diésel/gasolina y tren delantero/trasero.

## Estructura del proyecto

```
acelpro-website/
├── index.html          → Página principal (única página)
├── css/
│   └── styles.css       → Todos los estilos del sitio
├── js/
│   ├── main.js           → Navegación, scroll, formulario -> WhatsApp
│   └── chart.js          → Gráfico interactivo "Rendimiento del motor"
├── assets/
│   └── LEEME.txt          → Dónde poner tus imágenes reales (og-image, favicon)
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
- [ ] Revisar los valores del gráfico de rendimiento en `js/chart.js` (son ilustrativos — ajústalos si quieres reflejar datos reales de tus servicios).

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

## Sobre el gráfico interactivo "Rendimiento del motor"

Ubicado en el panel del hero, junto al motor 3D. Compara visualmente el rendimiento **antes** vs **después** de una mantención en AcelPro, en función de las RPM.

- Es interactivo: botones para filtrar "Antes / Comparar / Después", y al pasar el mouse (o el dedo en mobile) sobre el gráfico se muestra una línea guía con los valores exactos en cada punto.
- Los datos están en `js/chart.js`, en los arreglos `antesData` y `despuesData` — son **valores ilustrativos** pensados para comunicar la mejora de forma visual, no una medición real de dinamómetro. Si quieres usar datos reales de algún caso, edita esos arreglos (cada punto es `{ rpm, val }`).
- Construido en SVG + JavaScript puro, sin librerías externas — carga instantánea y no depende de conexión a internet más allá de las tipografías de Google Fonts.
