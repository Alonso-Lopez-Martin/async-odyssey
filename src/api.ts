export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null; 
  pl_bmasse: number | null; // Masa en proporciones terrestres
  pl_eqt: number | null;    // Temperatura de equilibrio en Kelvin
  discoverymethod: string;
  disc_year: number;
}

export async function searchExoplanet(query: string): Promise<Exoplanet[]> {
  let cleanQuery = query.toLowerCase()
    .replace("centauri", "cen")
    .replace("pegasi", "peg")
    .replace("cancri", "cnc")
    .replace(/([0-9])([a-z])/g, '$1 $2') 
    .trim();

  const cacheKey = `nasa_exo_v5_${cleanQuery.replace(/\s/g, '_')}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,discoverymethod,disc_year from ps where default_flag=1 and lower(pl_name) like '%${cleanQuery}%'`;
  const url = `/api/nasa/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error en la base de datos (Código: ${response.status})`);
  }

  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}