import { searchExoplanet } from './api';
import { showLoading, showError, clearMessage, renderPlanet } from './ui';
import { processResults, calculateMetrics } from './classify';

const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

let currentController: AbortController | null = null;
let currentRequestId = 0; 

async function executeSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showError("Por favor, escribe el nombre de un exoplaneta.");
    return;
  }

  if (currentController) {
    currentController.abort();
    clearMessage();
  }
  
  currentController = new AbortController();
  const reqId = ++currentRequestId;
  
  let isTimeout = false;
  const timeoutId = setTimeout(() => {
    isTimeout = true;
    currentController?.abort();
  }, 8000);

  try {
    searchBtn.disabled = true;
    showLoading(`Escaneando sectores buscando "${query}"...`);
    
    const resultados = await searchExoplanet(query, currentController.signal);

    if (resultados.length === 0) {
      showError(`El exoplaneta "${query}" no se ha encontrado.`);
      return;
    }

    const processed = processResults(resultados, query);
    
    // main.ts hace el cálculo y le pasa todo masticado a ui.ts
    const metrics = calculateMetrics(processed.bestMatch);

    clearMessage();
    renderPlanet(processed.bestMatch, metrics, processed);
    
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (isTimeout && currentRequestId === reqId) {
        showError("La conexión ha caducado por falta de respuesta (Timeout).");
      }
      return; // Si fue aborto manual por nueva búsqueda, no mostramos error
    }
    
    const mensajeError = error instanceof Error ? error.message : "Error desconocido";
    if (currentRequestId === reqId) showError(mensajeError);
  } finally {
    // El timer se limpia siempre (ruta feliz y ruta de error)
    clearTimeout(timeoutId);
    
    if (currentRequestId === reqId) {
      searchBtn.disabled = false;
    }
  }
}

searchBtn.addEventListener('click', executeSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') executeSearch();
});