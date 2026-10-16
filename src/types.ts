// CORRECCIÓN: Extraemos la interfaz a types.ts para evitar dependencias circulares a nivel de tipos.
export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null | undefined; 
  pl_bmasse: number | null | undefined; 
  pl_eqt: number | null | undefined;    
  pl_orbper: number | null | undefined; 
  discoverymethod: string;
  disc_year: number;
  hostname: string;        
  sy_dist: number | null | undefined;  
}