import type { Exoplanet } from './api';

export interface PlanetMetrics {
  densidad: number | null;
  gravedad: number | null;
  distAL: number | null;
  habitabilidad: string;
  tipoPlaneta: string;
  textura: string;
  radioBase: number; // Lo calculamos aquí para no repetir lógica en la UI
}

// Interfaz para el resultado procesado
export interface ProcessedData {
  bestMatch: Exoplanet;
  total: number;
  statsArray: string[];
}

/**
 * Corrección Módulos y Transformación: Toda la orquestación de datos (filtrado, 
 * deduplicación eficiente O(n), ordenación inmutable y reducción) sucede en este módulo puro.
 */
export function processResults(resultados: Exoplanet[], query: string): ProcessedData {
  // 1. Filtrar nombres inválidos
  const validos = resultados.filter(p => p.pl_name && p.pl_name.trim() !== '');

  // 2. Deduplicar usando Map para una complejidad O(n) en lugar de O(n^2)
  const mapaUnicos = new Map<string, Exoplanet>();
  validos.forEach(p => mapaUnicos.set(p.pl_name.toLowerCase(), p));
  const unicos = Array.from(mapaUnicos.values());

  // 3. Ordenación inmutable (toSorted en lugar de sort que mutaba el array original)
  const ordenados = unicos.toSorted((a, b) => (a.disc_year || 0) - (b.disc_year || 0));

  // 4. Conteo estadístico mediante reduce
  const metodosCount = ordenados.reduce((acc: Record<string, number>, p) => {
    const metodo = p.discoverymethod || 'Desconocido';
    acc[metodo] = (acc[metodo] || 0) + 1;
    return acc;
  }, {});

  // 5. Transformar con map a un array de strings
  const statsArray = Object.entries(metodosCount).map(([metodo, count]) => `${metodo}: ${count}`);

  // Corrección: Escoger por coincidencia exacta de texto primero, o fallback al más antiguo
  const queryLower = query.toLowerCase();
  const bestMatch = ordenados.find(p => p.pl_name.toLowerCase() === queryLower) || ordenados[0];

  return { bestMatch, total: ordenados.length, statsArray };
}

export function calculateMetrics(planet: Exoplanet): PlanetMetrics {
  const radioBase = planet.pl_rade !== null ? planet.pl_rade : (planet.pl_bmasse !== null ? Math.pow(planet.pl_bmasse, 0.33) : 1);
  const masa = planet.pl_bmasse;
  const temp = planet.pl_eqt;

  let densidad: number | null = null;
  let gravedad: number | null = null;

  if (masa !== null && planet.pl_rade !== null && planet.pl_rade !== 0) {
    densidad = (masa / Math.pow(planet.pl_rade, 3)) * 5.51;
    gravedad = masa / Math.pow(planet.pl_rade, 2);
  }

  const distAL = planet.sy_dist !== null ? Math.round(planet.sy_dist * 3.26156) : null;

  let habitabilidad = "Desconocida";
  if (temp !== null) {
    if (temp >= 273 && temp <= 373 && (densidad === null || densidad > 3.5)) {
      habitabilidad = "Potencialmente Habitable 💧";
    } else if (temp < 273) {
      habitabilidad = "Demasiado Frío ❄️";
    } else {
      habitabilidad = "Demasiado Caliente 🔥";
    }
  }

  /* 
   * NOTA ACADÉMICA SOBRE LA ASIGNACIÓN DE TEXTURAS:
   * A día de hoy, las limitaciones ópticas de nuestros telescopios nos impiden obtener
   * imágenes reales de la superficie de los exoplanetas. Por tanto, utilizamos un modelo 
   * de deducción basado en analogías con nuestro Sistema Solar. Primero determinamos el tipo 
   * físico (Lava, Océano, Gaseoso, etc.) mediante densidad y temperatura. Luego, aplicamos el 
   * módulo de la longitud del nombre del planeta (`nombre.length % n`) sobre un banco de texturas 
   * de esa misma categoría. Esto garantiza resultados visuales que, aunque representativos 
   * y arbitrarios dentro de su clase, son científicamente plausibles y persistentes entre búsquedas.
   */
  const texturas = {
    lava: ['/Venus.jpg', '/Jupiter_Io(B).jpg'],
    templado: ['/Mars.jpg'],
    helado: ['/Pluto.jpg', '/Pluto_Charon.jpg', '/Jupiter_Europa.jpg', '/Jupiter_Ganymede.jpg', '/Jupiter_Callisto.jpg'],
    enano: ['/Mars_Phobos.jpg'],
    gaseoso: ['/Jupiter.jpg', '/Saturn.jpg'],
    oceano: ['/Neptune.jpg', '/Saturn_Titan.jpg']
  };

  let tipoPlaneta = 'Desconocido';
  let texturaCategoria: keyof typeof texturas = 'enano';
  
  const seed = planet.pl_name.length;

  if (radioBase < 0.5) {
    tipoPlaneta = "Planeta Enano / Asteroide";
    texturaCategoria = 'enano';
  } else if (densidad !== null) {
    if (densidad >= 4) {
      if (temp !== null && temp > 800) { tipoPlaneta = "Rocoso (Mundo de Lava)"; texturaCategoria = 'lava'; }
      else if (temp !== null && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaCategoria = 'templado'; }
      else { tipoPlaneta = "Rocoso (Helado/Yermo)"; texturaCategoria = 'helado'; }
    } else if (densidad >= 2 && densidad < 4) {
      tipoPlaneta = "Mundo Océano / Minineptuno"; texturaCategoria = 'oceano';
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaCategoria = 'gaseoso';
    }
  } else {
    if (radioBase < 1.6) {
      if (temp !== null && temp > 800) { tipoPlaneta = "Rocoso (Lava)"; texturaCategoria = 'lava'; }
      else if (temp !== null && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaCategoria = 'templado'; }
      else { tipoPlaneta = "Rocoso (Helado)"; texturaCategoria = 'helado'; }
    } else if (radioBase < 4) {
      tipoPlaneta = "Supertierra / Gigante de Hielo"; texturaCategoria = 'oceano';
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaCategoria = 'gaseoso';
    }
  }

  const arraySeleccionado = texturas[texturaCategoria];
  const textura = arraySeleccionado[seed % arraySeleccionado.length];

  return { densidad, gravedad, distAL, habitabilidad, tipoPlaneta, textura, radioBase };
}