// src/api.ts

// Clave real de la NASA
const API_KEY = "lqLwTeQ6E7Z8FOrnlbpObenGlCTrmnQKJNxygLtZ";

// Definimos la "forma" de los datos con TypeScript para tener autocompletado y evitar errores
export interface MarsPhoto {
  id: number;
  img_src: string;
  earth_date: string;
}

interface MarsResponse {
  photos: MarsPhoto[];
}

/**
 * Función que pide los datos a la NASA.
 * Módulo ES: se usa `export` para exponerla.
 */
export async function getRoverPhotos(sol: string, camera: string): Promise<MarsPhoto[]> {
  // BONUS 15 pts: Uso de localStorage como caché[cite: 117]
  // Creamos un identificador único para esta combinación exacta de día y cámara
  const cacheKey = `nasa_curiosity_${sol}_${camera}`;
  
  // Intentamos leer del almacenamiento local[cite: 117]
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    console.log("Recuperado desde la caché local 🚀");
    // Convertimos el texto de vuelta a un array de objetos[cite: 116]
    return JSON.parse(cachedData);
  }

  // Si no estaba en caché, hacemos la petición a la red[cite: 114]
  console.log("Pidiendo datos a la NASA...");
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&camera=${camera}&api_key=${API_KEY}`;
  
  // async/await puro para la asincronía[cite: 111]
  const response = await fetch(url);
  
  // ROBUSTEZ: fetch no rechaza errores 404 o 500, hay que comprobar response.ok obligatoriamente[cite: 113, 114]
  if (!response.ok) {
    // Lanzar siempre un objeto Error, nunca un string[cite: 115]
    throw new Error(`Error de conexión con la NASA (Código: ${response.status})`);
  }

  // Parseamos la respuesta a JSON[cite: 114]
  const data = (await response.json()) as MarsResponse;
  
  // Guardamos las fotos en la caché convirtiendo el objeto a texto JSON
  localStorage.setItem(cacheKey, JSON.stringify(data.photos));

  return data.photos;
}