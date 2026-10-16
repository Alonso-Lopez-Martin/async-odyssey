import { getCache, setCache } from './cache';

export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null | undefined; 
  pl_bmasse: number | null | undefined; 
  pl_eqt: number | null | undefined;    
  pl_orbper: number | null | undefined; // PERÍODO ORBITAL (NUEVO)
  discoverymethod: string;
  disc_year: number;
  hostname: string;        
  sy_dist: number | null | undefined;  
}

export async function searchExoplanet(query: string, signal?: AbortSignal): Promise<Exoplanet[]> {
  // Uso de expresiones regulares globales y replaceAll para sanear a fondo
  let cleanQuery = query.toLowerCase()
    .replace(/centauri/gi, "cen")
    .replace(/pegasi/gi, "peg")
    .replace(/cancri/gi, "cnc")
    .replace(/([0-9])([a-z])/g, '$1 $2') 
    .trim();

  // Escapamos comillas simples (inyección) y comodines LIKE (%) para evitar barridos de tabla
  const sqlSafeQuery = cleanQuery
    .replace(/'/g, "''")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  const cacheKey = `nasa_exo_v9_${cleanQuery.replaceAll(/\s/g, '_')}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  // Añadimos pl_orbper (Período Orbital en días) para nuestro nuevo algoritmo de texturas
  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,pl_orbper,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${sqlSafeQuery}%'`;
  const baseUrl = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';
  const url = `${baseUrl}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
  
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Error HTTP de la API (Código: ${response.status})`);
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Respuesta inválida: El servidor no devolvió una lista.");
    }
    
    setCache(cacheKey, data);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TypeError' && !signal?.aborted) {
      throw new Error("Error de red (CORS). Nota: La NASA bloquea las peticiones desde dominios externos en producción sin proxy.");
    }
    throw error;
  }
}