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
  const radio = planet.pl_rade || (planet.pl_bmasse ? Math.pow(planet.pl_bmasse, 0.33) : 1);
  const sizePx = Math.round(150 * Math.min(Math.max(radio, 0.5), 2.5)); 
  const temp = planet.pl_eqt;
  const masa = planet.pl_bmasse;

  // CÁLCULOS ASTROFÍSICOS AVANZADOS
  let densidad: number | null = null;
  let gravedad: number | null = null;
  
  if (masa && planet.pl_rade) {
    densidad = (masa / Math.pow(planet.pl_rade, 3)) * 5.51;
    gravedad = masa / Math.pow(planet.pl_rade, 2); // Gravedad relativa a la Tierra (1g)
  }

  // Distancia en Años Luz (1 Pársec = 3.26156 AL)
  const distAL = planet.sy_dist ? Math.round(planet.sy_dist * 3.26156) : null;

  // Deducción de Habitabilidad
  let habitabilidad = "Desconocida";
  if (temp) {
    // Si la temperatura permite agua líquida y es un planeta rocoso (denso)
    if (temp >= 273 && temp <= 373 && (!densidad || densidad > 3.5)) {
      habitabilidad = "Potencialmente Habitable 💧";
    } else if (temp < 273) {
      habitabilidad = "Demasiado Frío ❄️";
    } else {
      habitabilidad = "Demasiado Caliente 🔥";
    }
  }

  // Colecciones de texturas locales
  const rocososCalientes = ['/Venus.jpg', '/Jupiter_Io(B).jpg'];
  const rocososTemplados = ['/Mars.jpg'];
  const rocososFrios = ['/Pluto.jpg', '/Pluto_Charon.jpg', '/Jupiter_Europa.jpg', '/Jupiter_Ganymede.jpg', '/Jupiter_Callisto.jpg'];
  const enanosYermos = ['/Mars_Phobos.jpg'];
  const gigantesGaseosos = ['/Jupiter.jpg', '/Saturn.jpg'];
  const densosOHelados = ['/Neptune.jpg', '/Saturn_Titan.jpg'];

  let texturaSeleccionada = '';
  let tipoPlaneta = 'Desconocido';
  const selector = planet.pl_name.length; 

  if (radio < 0.5) {
    tipoPlaneta = "Planeta Enano / Asteroide";
    texturaSeleccionada = enanosYermos[selector % enanosYermos.length];
  } else if (densidad !== null) {
    if (densidad >= 4) {
      if (temp && temp > 800) { tipoPlaneta = "Rocoso (Mundo de Lava)"; texturaSeleccionada = rocososCalientes[selector % rocososCalientes.length]; }
      else if (temp && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaSeleccionada = rocososTemplados[selector % rocososTemplados.length]; }
      else { tipoPlaneta = "Rocoso (Helado/Yermo)"; texturaSeleccionada = rocososFrios[selector % rocososFrios.length]; }
    } else if (densidad >= 2 && densidad < 4) {
      tipoPlaneta = "Mundo Océano / Minineptuno"; texturaSeleccionada = densosOHelados[selector % densosOHelados.length];
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaSeleccionada = gigantesGaseosos[selector % gigantesGaseosos.length];
    }
  } else {
    // Fallback por radio
    if (radio < 1.6) {
      if (temp && temp > 800) { tipoPlaneta = "Rocoso (Lava)"; texturaSeleccionada = rocososCalientes[selector % rocososCalientes.length]; }
      else if (temp && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaSeleccionada = rocososTemplados[selector % rocososTemplados.length]; }
      else { tipoPlaneta = "Rocoso (Helado)"; texturaSeleccionada = rocososFrios[selector % rocososFrios.length]; }
    } else if (radio < 4) {
      tipoPlaneta = "Supertierra / Gigante de Hielo"; texturaSeleccionada = densosOHelados[selector % densosOHelados.length];
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaSeleccionada = gigantesGaseosos[selector % gigantesGaseosos.length];
    }
  }

  planetDisplay.innerHTML = `
    <div class="planet-sphere" style="width: ${sizePx}px; height: ${sizePx}px; background-image: url('${texturaSeleccionada}');"></div>
  `;

  // Imprimimos la nueva cuadrícula estilo NASA
  planetInfo.innerHTML = `
    <h3>${planet.pl_name}</h3>
    <ul class="data-grid">
      <li><strong>Clasificación</strong> ${tipoPlaneta}</li>
      <li><strong>Habitabilidad</strong> ${habitabilidad}</li>
      <li><strong>Estrella Anfitriona</strong> ${planet.hostname}</li>
      <li><strong>Distancia</strong> ${distAL ? distAL + ' Años Luz' : 'Desconocida'}</li>
      <li><strong>Gravedad</strong> ${gravedad ? (Math.round(gravedad * 100) / 100) + ' x 🌍 (g)' : 'Datos insuficientes'}</li>
      <li><strong>Radio</strong> ${planet.pl_rade ? planet.pl_rade + ' x 🌍' : '~' + (Math.round(radio*10)/10) + ' x 🌍'}</li>
      <li><strong>Masa</strong> ${planet.pl_bmasse ? planet.pl_bmasse + ' x 🌍' : 'Desconocida'}</li>
      <li><strong>Densidad</strong> ${densidad ? (Math.round(densidad * 100) / 100) + ' g/cm³' : 'Desconocida'}</li>
      <li><strong>Temp. Equilibrio</strong> ${planet.pl_eqt ? planet.pl_eqt + ' K' : 'Desconocida'}</li>
      <li><strong>Descubrimiento</strong> ${planet.disc_year} (${planet.discoverymethod})</li>
    </ul>
  `;
}