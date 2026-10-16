import type { Exoplanet } from './types';

const TTL = 86400000; // 24 horas
const CURRENT_VERSION = 'v10'; // Subimos versión

export function cleanOldCaches() {
  // CORRECCIÓN: Limpiamos activamente cachés de versiones anteriores
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('nasa_exo_') && !key.includes(`_${CURRENT_VERSION}_`)) {
      localStorage.removeItem(key);
    }
  }
}

export function getCache(key: string): Exoplanet[] | null {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    // CORRECCIÓN: Validación estricta de la forma de los datos
    if (
      parsed != null &&
      typeof parsed.timestamp === 'number' &&
      Array.isArray(parsed.data) &&
      (Date.now() - parsed.timestamp < TTL)
    ) {
      return parsed.data as Exoplanet[];
    }
  } catch (e) {
    console.warn("Caché corrupta o estructura inválida.");
  }
  
  localStorage.removeItem(key);
  return null;
}

export function setCache(key: string, data: Exoplanet[]): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.warn("No se pudo guardar la caché.");
  }
}