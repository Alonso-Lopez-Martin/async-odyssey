import type { Exoplanet } from './api';
import { calculateMetrics } from './classify';

// Función para escapar caracteres peligrosos en el HTML (Sanitización básica contra XSS)
function escapeHTML(str: string | number | null): string {
  if (str === null || str === undefined) return 'Desconocida';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function showLoading(mensaje: string): void {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    messageBox.textContent = mensaje;
    messageBox.style.color = "#00d2ff";
  }
}

export function showError(mensaje: string): void {
  const messageBox = document.getElementById('message-box');
  const planetDisplay = document.getElementById('planet-display');
  const planetInfo = document.getElementById('planet-info');
  
  if (messageBox) {
    messageBox.textContent = `⚠ ${mensaje}`;
    messageBox.style.color = "#ff4444";
  }
  if (planetDisplay) planetDisplay.innerHTML = "";
  if (planetInfo) planetInfo.innerHTML = "";
}

export function clearMessage(): void {
  const messageBox = document.getElementById('message-box');
  if (messageBox) messageBox.textContent = "";
}

// Corrección: Pintado puro que confía en calculateMetrics y sanitiza los inputs
export function renderPlanet(planet: Exoplanet, metadataHtml: string = ""): void {
  const planetDisplay = document.getElementById('planet-display');
  const planetInfo = document.getElementById('planet-info');
  
  if (!planetDisplay || !planetInfo) return;

  const metrics = calculateMetrics(planet);
  
  const radioBase = planet.pl_rade !== null ? planet.pl_rade : (planet.pl_bmasse !== null ? Math.pow(planet.pl_bmasse, 0.33) : 1);
  const sizePx = Math.round(150 * Math.min(Math.max(radioBase, 0.5), 2.5)); 

  planetDisplay.innerHTML = `
    <div class="planet-sphere" style="width: ${sizePx}px; height: ${sizePx}px; background-image: url('${escapeHTML(metrics.textura)}');"></div>
  `;

  // Uso de escapeHTML en cada variable insertada
  planetInfo.innerHTML = `
    ${metadataHtml}
    <h3>${escapeHTML(planet.pl_name)}</h3>
    <ul class="data-grid">
      <li><strong>Clasificación</strong> ${escapeHTML(metrics.tipoPlaneta)}</li>
      <li><strong>Habitabilidad</strong> ${escapeHTML(metrics.habitabilidad)}</li>
      <li><strong>Estrella Anfitriona</strong> ${escapeHTML(planet.hostname)}</li>
      <li><strong>Distancia</strong> ${metrics.distAL !== null ? escapeHTML(metrics.distAL) + ' Años Luz' : 'Desconocida'}</li>
      <li><strong>Gravedad</strong> ${metrics.gravedad !== null ? escapeHTML(Math.round(metrics.gravedad * 100) / 100) + ' x 🌍 (g)' : 'Datos insuficientes'}</li>
      <li><strong>Radio</strong> ${planet.pl_rade !== null ? escapeHTML(planet.pl_rade) + ' x 🌍' : '~' + escapeHTML(Math.round(radioBase*10)/10) + ' x 🌍'}</li>
      <li><strong>Masa</strong> ${planet.pl_bmasse !== null ? escapeHTML(planet.pl_bmasse) + ' x 🌍' : 'Desconocida'}</li>
      <li><strong>Densidad</strong> ${metrics.densidad !== null ? escapeHTML(Math.round(metrics.densidad * 100) / 100) + ' g/cm³' : 'Desconocida'}</li>
      <li><strong>Temp. Equilibrio</strong> ${planet.pl_eqt !== null ? escapeHTML(planet.pl_eqt) + ' K' : 'Desconocida'}</li>
      <li><strong>Descubrimiento</strong> ${escapeHTML(planet.disc_year)} (${escapeHTML(planet.discoverymethod)})</li>
    </ul>
  `;
}