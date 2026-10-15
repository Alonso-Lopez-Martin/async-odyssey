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

export async function searchExoplanet(query: string, signal?: AbortSignal): Promise<Exoplanet[]> {
  const cleanQuery = query.toLowerCase()
    .replace("centauri", "cen")
    .replace("pegasi", "peg")
    .replace("cancri", "cnc")
    .replace(/([0-9])([a-z])/g, '$1 $2') 
    .trim()
    .replace(/'/g, "''");

  const cacheKey = `nasa_exo_v8_${cleanQuery.replace(/\s/g, '_')}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < 86400000) {
        return parsedCache.data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${cleanQuery}%'`;
  const baseUrl = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';
  const url = `${baseUrl}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
  
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Error de la API NASA (Código: ${response.status})`);
    
    const data = await response.json();
    
    // Corrección: Validamos el contrato del JSON para evitar que métodos de array exploten
    if (!Array.isArray(data)) {
      throw new Error("El servidor no devolvió una lista válida de planetas.");
    }
    
    // Corrección: Protegemos la inserción en localStorage ante cuotas llenas o navegadores privados
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (storageError) {
      console.warn("No se pudo guardar la caché (Cuota excedida o modo privado).");
    }

    return data;
  } catch (error: any) {
    // Corrección: Distinguimos errores de red puros de otros fallos para documentar el problema de CORS en producción
    if (error.name === 'TypeError' && !signal?.aborted) {
      throw new Error("Error de red o restricción CORS. Si estás en producción, la NASA bloquea las peticiones desde otros dominios.");
    }
    throw error;
  }
}