# AcelPro — Landing Page

Sitio web estático (HTML + CSS + JS puro, sin frameworks ni dependencias de build) para el taller mecánico AcelPro, especializado en motores diésel/gasolina y tren delantero/trasero.

## Estructura del proyecto

```
acelpro-website/
├── index.html               → Página principal (única página)
├── css/
│   └── styles.css            → Todos los estilos del sitio
├── js/
│   └── main.js                → Navegación, scroll, menú mobile, formulario -> WhatsApp
├── assets/
│   ├── acelpro-icon.png        → Ícono del arco (logo), usado en header y footer
│   ├── acelpro-icon-square.png  → Versión cuadrada del ícono (favicon + schema.org)
│   ├── distribucion-motor.jpg    → Foto de fondo del hero
│   ├── logo-original-cortado-NO-USAR.png → archivo original con la "O" cortada (sin usar, ver LEEME.txt)
│   └── LEEME.txt                  → Notas sobre las imágenes
├── robots.txt                → Indicaciones para buscadores (Google, Bing)
├── sitemap.xml                → Mapa del sitio para Google Search Console
├── .htaccess                   → Cabeceras de seguridad (hosting Apache/cPanel)
├── _headers                     → Cabeceras de seguridad (Netlify / Cloudflare Pages)
├── vercel.json                    → Cabeceras de seguridad (Vercel)
└── README.md                        → Este archivo
```

No requiere `npm install`, build step, ni servidor backend. Es 100% archivos estáticos: se suben tal cual a cualquier hosting.

---

## Cómo publicarlo (elige tu hosting)

### Opción A — Hosting tradicional / cPanel (lo más común en Chile)
1. Entra al **Administrador de archivos** de tu hosting o conéctate por **FTP** (FileZilla, etc.).
2. Sube **todo el contenido de esta carpeta** (no la carpeta en sí, su contenido) dentro de `public_html/` o `www/`.
3. Verifica que `index.html` quede directamente en la raíz de `public_html/`.
4. Activa el certificado **SSL gratuito (Let's Encrypt)** desde el panel de hosting.
5. Una vez confirmado que el SSL funciona, abre `.htaccess` y descomenta el bloque de "Forzar HTTPS".

### Opción B — Netlify
Arrastra la carpeta completa a "Deploys" (drag & drop), o conecta tu repositorio Git. El archivo `_headers` se aplica automáticamente.

### Opción C — Vercel
Conecta tu repositorio o usa `vercel deploy` desde la carpeta. El archivo `vercel.json` se aplica automáticamente.

### Opción D — GitHub Pages
Sube esta carpeta a un repositorio y activa GitHub Pages en Settings → Pages. Nota: no soporta `.htaccess`, así que las cabeceras de seguridad no aplicarán (usa Netlify o Vercel si eso es prioritario).

---

## Checklist antes de publicar

- [ ] Reemplazar `https://www.acelpro.cl/` por tu dominio real en: `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` y `sitemap.xml`.
- [ ] Subir una foto real del taller (1200×630px) a `assets/og-image.jpg` — la ruta ya está lista en el código.
- [ ] Verificar la dirección y horario en la sección de contacto (actualmente: Av. Diego Portales 1167, La Florida, Santiago).
- [ ] Crear/reclamar la ficha de **Google Business Profile** con estos mismos datos — sigue siendo el factor #1 para el mapa local de Google.
- [ ] Verificar el dominio en **Google Search Console** y enviar el `sitemap.xml`.
- [ ] Si en algún momento consigues un logo en imagen completo (sin cortes), puedes reemplazar el ícono actual — ver instrucciones en `assets/LEEME.txt`.

---

## El logo: qué pasó y cómo se resolvió

El archivo que subiste (`logo-original-cortado-NO-USAR.png`) tiene un problema real en el archivo mismo: **la "O" de "PRO" nunca se guardó en la imagen** — se comprueba abriéndolo directamente, el PNG termina en la R. No era un bug de CSS ni de cómo se mostraba en el navegador; ningún ajuste de tamaño lo iba a arreglar.

**Solución aplicada:**
- Se extrajo el ícono del arco (la parte gráfica, que sí está completa) usando detección de componentes conectados para separarlo limpiamente de las letras superpuestas.
- El texto "ACEL PRO" ahora se escribe como **texto HTML real** (no como imagen), con "ACEL" en blanco y "PRO" en azul — así es imposible que se vuelva a cortar, se ve nítido en cualquier pantalla/resolución, y pesa una fracción de lo que pesaba la imagen completa.
- El favicon y el dato estructurado (`schema.org`) para Google también se actualizaron para usar el ícono nuevo en vez de la imagen rota.

Si más adelante consigues el archivo de logo completo (sin recortar), lo podemos volver a poner como imagen — las instrucciones están en `assets/LEEME.txt`.

---

## Paleta de colores

Azul moderado (no saturado al extremo) + blanco + grafito oscuro, inspirado en el logo:
- `--orange: #3f76a8` (así se llama la variable internamente por herencia del sistema de diseño original, pero su valor es el azul de marca — se usa para todos los acentos, botones y highlights)
- `--orange-dark: #315f89` (estado hover/activo)
- Todos los íconos (barra de garantías, tarjetas de servicio, ubicación) heredan este color automáticamente vía variables CSS — si más adelante quieres ajustar el tono, basta con cambiar estos dos valores en `css/styles.css` y se actualiza en todo el sitio.

---

## Auditoría de seguridad

El sitio es estático (sin base de datos, sin login, sin backend propio), por lo que la superficie de ataque es baja. Se revisaron y corrigieron:

| # | Hallazgo | Solución |
|---|---|---|
| 1 | El formulario armaba el link de WhatsApp sin codificar el texto del usuario | `encodeURIComponent()` en `js/main.js` |
| 2 | Enlaces externos solo con `rel="noopener"` | Se agregó también `noreferrer` |
| 3 | Sin Content-Security-Policy | Meta-etiqueta CSP restringiendo scripts/estilos/iframes solo a orígenes necesarios |
| 4 | CSP con permisos de más para la API de Google Maps (solo se usa un iframe simple, no la API JS) | Se retiraron los permisos innecesarios (`maps.googleapis.com`, `maps.gstatic.com`) — la política ahora es más estricta |
| 5 | Sin `X-Frame-Options` / `X-Content-Type-Options` | Agregadas vía `.htaccess`, `_headers` y `vercel.json` |
| 6 | Sin `Referrer-Policy` | `strict-origin-when-cross-origin` |
| 7 | Listado de directorios habilitado por defecto en Apache | `Options -Indexes` en `.htaccess` |
| 8 | Sin forzado de HTTPS | Regla lista en `.htaccess` (activar cuando tengas el SSL funcionando) |

**No se encontraron:** manejadores de eventos inline, `eval()`, inserción de datos de usuario vía `innerHTML`, enlaces `http://` inseguros.

**Lo que debes hacer tú:** activar el SSL en tu hosting y descomentar el bloque HTTPS/HSTS en `.htaccess` una vez esté funcionando.

---

## Responsive

Auditado a nivel de código contra los rangos típicos: teléfonos (320–480px), teléfonos grandes (481–767px), tablets (768–1024px), notebooks (1025–1440px), monitores grandes (1441px+).

**Bug corregido:** el header se desbordaba en teléfonos porque el botón "Agendar diagnóstico" no se ocultaba al agregar la dirección junto al logo. Se ocultó ese botón en móvil (≤860px) y se agregó la misma acción dentro del menú desplegable, para no perder la llamada a la acción.

Otras mejoras: resguardo global contra scroll horizontal, área táctil de 40×40px para el ícono de ubicación en mobile, franja de garantías a una columna en teléfonos angostos, botones del hero apilados a ancho completo en pantallas muy chicas.

> Nota: no fue posible tomar capturas reales con navegador headless en este entorno (la instalación de Chromium está bloqueada por la red restringida). La revisión se hizo midiendo anchos de contenido contra cada punto de quiebre en el código. Para una verificación 100% visual: Chrome → F12 → modo responsive.

---

## SEO

**Palabras clave objetivo:** taller mecánico, mecánico, mecánica, servicio automotriz — con foco geográfico en La Florida, Santiago (la única franja realmente ganable frente a directorios y competidores establecidos).

Cambios aplicados:
- Title, meta description, Open Graph y Twitter Card reescritos para incluir las 4 palabras clave de forma natural.
- Contenido del hero, sección de servicios y footer reforzado con "servicio automotriz" y "mecánica" (antes "servicio automotriz" no aparecía ni una vez en toda la página).
- Alt de la imagen del hero, ahora descriptivo con palabras clave reales.
- **Sección de Preguntas Frecuentes** (`#faq`) con 6 preguntas reales, construida con `<details>/<summary>` nativo (sin JavaScript, 100% accesible).
- **Schema FAQPage**: verificado programáticamente que las 6 preguntas y respuestas coinciden exactamente con el texto visible (requisito de Google para el rich snippet).
- El schema `AutoRepair` incluye ahora una `description` con las palabras clave y una oferta genérica de "Servicio automotriz y mecánica general".

**Expectativa honesta:** "mecánico"/"mecánica" a secas, sin ciudad, es prácticamente imposible de ganar a nivel nacional (dominado por directorios y sitios con años de autoridad). "Taller mecánico" y "servicio automotriz" con intención local (La Florida, Santiago, "cerca de mí") sí son alcanzables, y es donde están enfocados estos cambios. El factor que más pesa para el mapa local no es el código de la página — es tu ficha de **Google Business Profile** (reseñas, fotos, categoría correcta).
