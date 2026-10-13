export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null; 
  discoverymethod: string;
  disc_year: number;
}

export async function searchExoplanet(query: string): Promise<Exoplanet[]> {
  // Arreglamos la búsqueda: añadimos un espacio entre número y letra (ej: 16b -> 16 b)
  let cleanQuery = query.toLowerCase()
    .replace("centauri", "cen")
    .replace("pegasi", "peg")
    .replace("cancri", "cnc")
    .replace(/([0-9])([a-z])/g, '$1 $2') // Precisión exacta
    .trim();

  const cacheKey = `nasa_exo_v4_${cleanQuery.replace(/\s/g, '_')}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const sql = `select pl_name,pl_rade,discoverymethod,disc_year from ps where default_flag=1 and lower(pl_name) like '%${cleanQuery}%'`;
  const url = `/api/nasa/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error en la base de datos (Código: ${response.status})`);
  }

  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}