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

  // LÓGICA FÍSICA: Calculamos la densidad en g/cm³ (La densidad de la Tierra es ~5.51 g/cm³)
  // Fórmula: (Masa Terrestre / Radio Terrestre al cubo) * 5.51
  let densidad: number | null = null;
  if (masa && planet.pl_rade) {
    densidad = (masa / Math.pow(planet.pl_rade, 3)) * 5.51;
  }

  // Colecciones de imágenes
  const rocososCalientes = ['/Venus.jpg', '/Jupiter_Io(B).jpg'];
  const rocososTemplados = ['/Mars.jpg'];
  const rocososFrios = ['/Pluto.jpg', '/Pluto_Charon.jpg', '/Jupiter_Europa.jpg', '/Jupiter_Ganymede.jpg', '/Jupiter_Callisto.jpg'];
  const enanosYermos = ['/Mars_Phobos.jpg'];
  const gigantesGaseosos = ['/Jupiter.jpg', '/Saturn.jpg'];
  const densosOHelados = ['/Neptune.jpg', '/Saturn_Titan.jpg'];

  let texturaSeleccionada = '';
  let tipoPlaneta = 'Desconocido';
  const selectorAtor = planet.pl_name.length; 

  // DEDUCCIÓN ASTROFÍSICA AVANZADA (Densidad + Temperatura)
  if (radio < 0.5) {
    tipoPlaneta = "Planeta Enano / Asteroide";
    texturaSeleccionada = enanosYermos[selectorAtor % enanosYermos.length];
    
  } else if (densidad !== null) {
    
    // 1. SI TENEMOS DENSIDAD, ELLA DICTA LA GEOLOGÍA
    if (densidad >= 4) {
      // Alta densidad = Rocoso o Metálico
      if (temp && temp > 800) {
        tipoPlaneta = "Rocoso (Mundo de Lava/Infernal)";
        texturaSeleccionada = rocososCalientes[selectorAtor % rocososCalientes.length];
      } else if (temp && temp > 200 && temp < 400) {
        tipoPlaneta = "Rocoso (Templado/Habitable)";
        texturaSeleccionada = rocososTemplados[selectorAtor % rocososTemplados.length];
      } else {
        tipoPlaneta = "Rocoso (Mundo Helado/Yermo)";
        texturaSeleccionada = rocososFrios[selectorAtor % rocososFrios.length];
      }
    } else if (densidad >= 2 && densidad < 4) {
      // Densidad media = Mucha agua o atmósfera súper densa
      tipoPlaneta = "Mundo Océano / Hielo / Minineptuno";
      texturaSeleccionada = densosOHelados[selectorAtor % densosOHelados.length];
    } else {
      // Baja densidad = Todo gas
      tipoPlaneta = "Gigante Gaseoso";
      texturaSeleccionada = gigantesGaseosos[selectorAtor % gigantesGaseosos.length];
    }
    
  } else {
    // 2. FALLBACK: Si falta la masa o el radio, intentamos adivinar solo por el tamaño
    if (radio < 1.6) {
      if (temp && temp > 800) {
        tipoPlaneta = "Rocoso (Mundo de Lava)";
        texturaSeleccionada = rocososCalientes[selectorAtor % rocososCalientes.length];
      } else if (temp && temp > 200 && temp < 400) {
        tipoPlaneta = "Rocoso (Templado)";
        texturaSeleccionada = rocososTemplados[selectorAtor % rocososTemplados.length];
      } else {
        tipoPlaneta = "Rocoso (Mundo Helado)";
        texturaSeleccionada = rocososFrios[selectorAtor % rocososFrios.length];
      }
    } else if (radio < 4) {
      tipoPlaneta = "Supertierra / Gigante de Hielo";
      texturaSeleccionada = densosOHelados[selectorAtor % densosOHelados.length];
    } else {
      tipoPlaneta = "Gigante Gaseoso";
      texturaSeleccionada = gigantesGaseosos[selectorAtor % gigantesGaseosos.length];
    }
  }

  // Renderizamos la esfera
  planetDisplay.innerHTML = `
    <div class="planet-sphere" style="width: ${sizePx}px; height: ${sizePx}px; background-image: url('${texturaSeleccionada}');"></div>
  `;

  // Imprimimos la telemetría añadiendo la Densidad calculada
  planetInfo.innerHTML = `
    <h3>${planet.pl_name}</h3>
    <ul>
      <li><strong>Clasificación:</strong> ${tipoPlaneta}</li>
      <li><strong>Radio:</strong> ${planet.pl_rade ? planet.pl_rade + ' x 🌍' : (planet.pl_bmasse ? '~' + (Math.round(radio*10)/10) + ' x 🌍 (est.)' : 'Sin datos')}</li>
      <li><strong>Masa:</strong> ${planet.pl_bmasse ? planet.pl_bmasse + ' x 🌍' : 'Sin datos'}</li>
      <li><strong>Densidad (Calculada):</strong> ${densidad ? (Math.round(densidad * 100) / 100) + ' g/cm³' : 'Datos insuficientes'}</li>
      <li><strong>Temperatura de Equilibrio:</strong> ${planet.pl_eqt ? planet.pl_eqt + ' K' : 'Sin datos'}</li>
    </ul>
  `;
}