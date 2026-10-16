import type { Exoplanet } from './types';
import { getCache, setCache, cleanOldCaches } from './cache';

// Ejecutamos limpieza de basura al cargar el módulo
cleanOldCaches();

export async function searchExoplanet(query: string, signal?: AbortSignal): Promise<Exoplanet[]> {
  const cleanQuery = query.toLowerCase()
    .replaceAll(/centauri/gi, "cen")
    .replaceAll(/pegasi/gi, "peg")
    .replaceAll(/cancri/gi, "cnc")
    .replace(/([0-9])([a-z])/g, '$1 $2') 
    .trim();

  // CORRECCIÓN: Escapado correcto para ADQL. Comillas dobles y comodines con barra invertida.
  const sqlSafeQuery = cleanQuery
    .replaceAll(/'/g, "''")
    .replaceAll(/%/g, "\\%")
    .replaceAll(/_/g, "\\_");

  const cacheKey = `nasa_exo_v10_${cleanQuery.replaceAll(/\s/g, '_')}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  // CORRECCIÓN: Añadida la cláusula ESCAPE '\' que exige el estándar ADQL para el LIKE seguro
  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,pl_orbper,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${sqlSafeQuery}%' ESCAPE '\\'`;
  
  const baseUrl = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';
  const url = `${baseUrl}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
  
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Error HTTP de la API (Código: ${response.status})`);
    
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("El servidor devolvió un formato no válido.");
    
    setCache(cacheKey, data);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TypeError' && !signal?.aborted) {
      // CORRECCIÓN: Distinguimos pérdida de red de problema CORS.
      if (!navigator.onLine) {
        throw new Error("No hay conexión a Internet. Revisa tu red.");
      }
      throw new Error("CORS_ERROR"); // Lanzamos un error tipificado para capturarlo en ui.ts
    }
    throw error;
  }
}