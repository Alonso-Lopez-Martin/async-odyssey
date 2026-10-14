# Explorador de Exoplanetas

Misión M2 · Asincronía y APIs — Web Development I.

## Cómo probarlo
Para arrancar este proyecto necesitas tener Node.js instalado. Abre la terminal en la carpeta del proyecto y ejecuta:
1. `npm install` (para instalar las dependencias).
2. `npm run dev` (para levantar el servidor de Vite).
Abre el enlace de `localhost` en tu navegador. Escribe el nombre de un exoplaneta (ej. "Kepler-16 b", "TRAPPIST-1 e" o "55 Cancri e") y pulsa Enter o el botón de buscar para ver su renderizado 3D y su telemetría.

*Nota importante:* El proyecto debe ejecutarse a través de `npm run dev` porque utiliza el servidor interno de Vite (`vite.config.ts`) como proxy para saltarse las restricciones de CORS de la API de la NASA.

## Uso de IA
Usé Gemini como un consultor técnico para resolver bloqueos de CSS, de programación y de peticiones a la API.
Ejemplo de prompt real: *"Quiero utilizar estos tres parámetros Radio, Masa (Masa y Radio => Densidad) y Temperatura para elegir el renderizado que utilizo para cada planeta, que valores utilizarías tú o como lo harías para elegir el renderizado según esas tres propiedades."* o *"Tengo un problema, todos los planetas se ven como una bola negra como hago para solucionarlo"*.
Verifiqué cada cambio probando el código en el navegador (comprobando que la consola no diera errores 403 o 404), lanzando búsquedas con nombres raros para forzar fallos, y revisando visualmente que el renderizado de la esfera 3D no se rompiera al redimensionar.
Escribí a mano / decidí yo mismo: La idea general del diseño, la decisión de qué parámetros físicos usar (densidad y temperatura) para la clasificación de los planetas, la búsqueda de las texturas equirectangulares correctas y lo más importante gran parte del código.

## Autopsia
A lo largo del proyecto he tenido que tomar bastantes decisiones arquitectónicas para ir sorteando problemas graves que me iban bloqueando:

1. **El abandono de la Mars Rover API:** Mi idea inicial era hacer un proyecto sobre las fotos de los Rovers de Marte, pero resultó que la NASA ya no le da soporte a esa API y fallaba constantemente. Descarté seguir peleando con una API rota y pivoté todo el proyecto hacia la *NASA Exoplanet Archive (TAP)*, que es mucho más compleja porque funciona con consultas tipo SQL (ADQL), pero es mucho más robusta.
2. **El bloqueo por CORS y el proxy:** Al intentar consumir la API de exoplanetas, `corsproxy.io` me devolvía un error 403 Forbidden. Descarté seguir usando proxies de terceros gratuitos porque son inestables y configuré un proxy local directamente en `vite.config.ts` para engañar al navegador durante el desarrollo, dejando un fallback a conexión directa para producción.
3. **El problema de la "bola negra" en el renderizado 3D:** Renderizar el planeta usando CSS `box-shadow` e imágenes externas fue un dolor de cabeza. Primero usé fotos normales y la sombra se comía el planeta o salían bordes negros; luego usé URLs de CDNs de GitHub que daban error 404 o me bloqueaban por *hotlinking*. Descarté depender de servidores externos y opté por descargar 13 texturas equirectangulares del Sistema Solar y alojarlas estáticamente en la carpeta `/public`. Usamos imágenes de nuestro sistema solar porque, por límites físicos y ópticos, actualmente es imposible obtener fotografías reales de la superficie de exoplanetas, así que la app deduce el análogo más parecido usando la densidad y la temperatura.
4. **Acoplamiento de lógica e interfaz:** Inicialmente, el cálculo matemático de la densidad y la asignación de texturas estaban mezclados con la inyección del HTML en `ui.ts`. Descarté dejarlo así tras el feedback que me dio la Web Arena y extraje toda la lógica a un archivo de funciones puras (`classify.ts`). Ahora entran datos brutos y salen métricas procesadas, sin tocar el DOM.
5. **Falta de transformación de datos:** El código original solo cogía el índice `[0]` del array que devolvía la API. Para cumplir los requisitos de la misión, implementé un sistema completo en `main.ts` usando `filter` (para limpiar nulos), `reduce` (para deduplicar entradas del mismo planeta y para contar los métodos de descubrimiento), `sort` (para ordenarlos por año) y `map` (para formatear las estadísticas en el HTML).
6. **Agujeros de robustez:** El proyecto era frágil ante fallos. Descarté dejar las consultas SQL crudas y añadí un reemplazo de comillas simples para evitar inyección ADQL; protegí el `JSON.parse` del localStorage con un bloque `try/catch` y le puse caducidad de 24 horas; añadí un `AbortController` para que las búsquedas rápidas no se pisen entre sí; y creé una función `escapeHTML` para evitar inyecciones XSS al renderizar los datos en el dashboard.