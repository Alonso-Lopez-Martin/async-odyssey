export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null; 
  pl_bmasse: number | null; 
  pl_eqt: number | null;    
  discoverymethod: string;
  disc_year: number;
  hostname: string;        
  sy_dist: number | null;  
}

// Añadimos soporte para AbortSignal para poder cancelar peticiones obsoletas
export async function searchExoplanet(query: string, signal?: AbortSignal): Promise<Exoplanet[]> {
  // Limpieza inicial
  let cleanQuery = query.toLowerCase()
    .replace("centauri", "cen")
    .replace("pegasi", "peg")
    .replace("cancri", "cnc")
    .replace(/([0-9])([a-z])/g, '$1 $2') 
    .trim();

  // Corrección: Escapamos las comillas simples para evitar inyecciones SQL en ADQL
  cleanQuery = cleanQuery.replace(/'/g, "''");

  const cacheKey = `nasa_exo_v7_${cleanQuery.replace(/\s/g, '_')}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      // Corrección: JSON.parse protegido con try/catch y caducidad de caché (24h)
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < 86400000) {
        return parsedCache.data;
      }
    } catch (e) {
      console.warn("Caché corrupta, limpiando...", e);
      localStorage.removeItem(cacheKey);
    }
  }

  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${cleanQuery}%'`;
  
  // Corrección: Resolución del proxy para producción (fallback a conexión directa CORS)
  const baseUrl = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';
  const url = `${baseUrl}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
  
  const response = await fetch(url, { signal });
  
  if (!response.ok) {
    throw new Error(`Error en la matriz de comunicaciones (Código: ${response.status})`);
  }

  const data = await response.json();
  
  // Guardamos en caché con un timestamp
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}