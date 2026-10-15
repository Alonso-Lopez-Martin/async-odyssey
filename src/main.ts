import { searchExoplanet } from './api';
import { showLoading, showError, clearMessage, renderPlanet } from './ui';
import { processResults } from './classify';

const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

let currentController: AbortController | null = null;
let currentRequestId = 0; // Usado para saber qué petición maneja el estado visual final

async function executeSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showError("Por favor, escribe el nombre de un exoplaneta.");
    return;
  }

  // Cancelar petición anterior y limpiar su posible carga
  if (currentController) {
    currentController.abort();
    clearMessage();
  }
  
  currentController = new AbortController();
  const reqId = ++currentRequestId;
  
  // Añadimos un timeout de seguridad (8 segundos)
  const timeoutId = setTimeout(() => currentController?.abort(), 8000);

  try {
    searchBtn.disabled = true;
    showLoading(`Escaneando sectores buscando "${query}"...`);
    
    const resultados = await searchExoplanet(query, currentController.signal);
    clearTimeout(timeoutId);

    if (resultados.length === 0) {
      showError(`El exoplaneta "${query}" no se ha encontrado.`);
      return;
    }

    // El módulo de lógica pura orquesta los datos ahora
    const processed = processResults(resultados, query);

    clearMessage();
    renderPlanet(processed.bestMatch, processed);
    
  } catch (error: any) {
    // Evitamos mostrar errores de peticiones canceladas o caducadas intencionalmente
    if (error.name === 'AbortError' || currentController?.signal.aborted) {
      if (currentRequestId === reqId) showError("La conexión ha caducado por falta de respuesta (Timeout).");
      return;
    }
    const mensajeError = error instanceof Error ? error.message : String(error);
    showError(mensajeError);
  } finally {
    // Corrección Asincronía: Solo el proceso activo actual tiene derecho a rehabilitar la UI
    if (currentRequestId === reqId) {
      searchBtn.disabled = false;
    }
  }
}

searchBtn.addEventListener('click', executeSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') executeSearch();
});