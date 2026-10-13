import type { Exoplanet } from './api';

const planetDisplay = document.getElementById('planet-display') as HTMLDivElement;
const planetInfo = document.getElementById('planet-info') as HTMLDivElement;
const messageBox = document.getElementById('message-box') as HTMLParagraphElement;

export function showLoading(mensaje: string): void {
  messageBox.textContent = mensaje;
  messageBox.style.color = "#00d2ff";
}

export function showError(mensaje: string): void {
  messageBox.textContent = `⚠ ${mensaje}`;
  messageBox.style.color = "#ff4444";
  planetDisplay.innerHTML = "";
  planetInfo.innerHTML = "";
}

export function clearMessage(): void {
  messageBox.textContent = "";
}

export function renderPlanet(planet: Exoplanet): void {
  const radio = planet.pl_rade ? Math.min(Math.max(planet.pl_rade, 0.5), 2.5) : 1;
  const sizePx = Math.round(150 * radio);

  // Texturas 100% extraterrestres y fiables alojadas en un CDN profesional
  const texturas = [
    'https://unpkg.com/three@0.160.0/examples/textures/planets/mars_1k_color.jpg',      // Rocoso rojo
    'https://unpkg.com/three@0.160.0/examples/textures/planets/moon_1024.jpg',          // Rocoso cráteres (gris)
    'https://unpkg.com/three@0.160.0/examples/textures/planets/venus_surface_2048.jpg'  // Superficie densa/volcánica
  ];

  const indiceTextura = planet.pl_name.length % texturas.length;
  const texturaSeleccionada = texturas[indiceTextura];

  planetDisplay.innerHTML = `
    <div class="planet-sphere" style="width: ${sizePx}px; height: ${sizePx}px; background-image: url('${texturaSeleccionada}');"></div>
  `;

  planetInfo.innerHTML = `
    <h3>${planet.pl_name}</h3>
    <ul>
      <li><strong>Radio Terrestre:</strong> ${planet.pl_rade ? planet.pl_rade + ' x 🌍' : 'Desconocido'}</li>
      <li><strong>Método:</strong> ${planet.discoverymethod}</li>
      <li><strong>Año de hallazgo:</strong> ${planet.disc_year}</li>
    </ul>
  `;
}