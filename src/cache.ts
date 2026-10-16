import type { Exoplanet } from './api';

const TTL = 86400000; // 24 horas

export function getCache(key: string): Exoplanet[] | null {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const parsedCache = JSON.parse(cached);
    // Validación de la forma (shape) de los datos cacheados
    if (
      parsedCache && 
      typeof parsedCache.timestamp === 'number' && 
      Array.isArray(parsedCache.data) &&
      (Date.now() - parsedCache.timestamp < TTL)
    ) {
      return parsedCache.data;
    }
  } catch (e) {
    console.warn("Caché corrupta o inválida, se ignorará.", e);
  }
  
  localStorage.removeItem(key);
  return null;
}

export function setCache(key: string, data: Exoplanet[]): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.warn("No se pudo guardar la caché (Cuota excedida o modo privado).");
  }
}