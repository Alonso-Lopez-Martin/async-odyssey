import type { Exoplanet } from './api';

// Interfaz para agrupar las métricas calculadas sin tocar el DOM
export interface PlanetMetrics {
  densidad: number | null;
  gravedad: number | null;
  distAL: number | null;
  habitabilidad: string;
  tipoPlaneta: string;
  textura: string;
}

// Corrección: Módulo de funciones puras. Entran datos, salen datos, sin tocar el HTML.
export function calculateMetrics(planet: Exoplanet): PlanetMetrics {
  // Manejo robusto de nulos: verificamos explícitamente !== null para no ignorar valores '0'
  const radio = planet.pl_rade !== null ? planet.pl_rade : (planet.pl_bmasse !== null ? Math.pow(planet.pl_bmasse, 0.33) : 1);
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
   * JUSTIFICACIÓN CIENTÍFICA:
   * Utilizamos imágenes de planetas y lunas de nuestro propio Sistema Solar porque, a día de hoy, 
   * existen límites físicos y ópticos insalvables que nos impiden obtener fotografías reales de 
   * la superficie de los exoplanetas (se ven a lo sumo como un píxel borroso). 
   * Por tanto, aplicamos una deducción astrofísica basada en la densidad y temperatura real del 
   * exoplaneta para asignarle el análogo geológico más preciso posible dentro de nuestro catálogo.
   */
  
  // Corrección: Reemplazo de cadenas if/else largas por una tabla de reglas simple
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
  
  // Usamos la longitud del nombre como semilla determinista
  const seed = planet.pl_name.length;

  if (radio < 0.5) {
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
    // Estimación por radio si falta la masa
    if (radio < 1.6) {
      if (temp !== null && temp > 800) { tipoPlaneta = "Rocoso (Lava)"; texturaCategoria = 'lava'; }
      else if (temp !== null && temp > 200 && temp < 400) { tipoPlaneta = "Rocoso (Templado)"; texturaCategoria = 'templado'; }
      else { tipoPlaneta = "Rocoso (Helado)"; texturaCategoria = 'helado'; }
    } else if (radio < 4) {
      tipoPlaneta = "Supertierra / Gigante de Hielo"; texturaCategoria = 'oceano';
    } else {
      tipoPlaneta = "Gigante Gaseoso"; texturaCategoria = 'gaseoso';
    }
  }

  const arraySeleccionado = texturas[texturaCategoria];
  const textura = arraySeleccionado[seed % arraySeleccionado.length];

  return { densidad, gravedad, distAL, habitabilidad, tipoPlaneta, textura };
}