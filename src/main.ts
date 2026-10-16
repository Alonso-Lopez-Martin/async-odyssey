import { searchExoplanet } from './api';
import { showLoading, showError, clearMessage, renderPlanet, renderMatchesList } from './ui';
import { processResults, calculateMetrics } from './classify';
import { FetchManager } from './fetchManager';
import type { Exoplanet } from './types';

const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

// Instanciamos el manager puro
const fetchManager = new FetchManager();
let currentProcessedData: any = null; // Guardamos contexto

function displaySelectedPlanet(planet: Exoplanet) {
  if (!currentProcessedData) return;
  const metrics = calculateMetrics(planet);
  renderPlanet(planet, metrics, currentProcessedData);
}

async function executeSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showError("Por favor, escribe el nombre de un exoplaneta.");
    return;
  }

  clearMessage();
  document.getElementById('matches-container')!.innerHTML = ""; // Limpiamos lista
  const { reqId, signal, timeoutId } = fetchManager.startRequest(8000);

  try {
    searchBtn.disabled = true;
    showLoading(`Escaneando sectores buscando "${query}"...`);
    
    const resultados = await searchExoplanet(query, signal);

    if (resultados.length === 0) {
      showError(`El exoplaneta "${query}" no se ha encontrado.`);
      return;
    }

    currentProcessedData = processResults(resultados, query);
    clearMessage();
    
    // Mostramos la lista interactiva y pintamos el mejor match por defecto
    renderMatchesList(currentProcessedData.allMatches, displaySelectedPlanet);
    displaySelectedPlanet(currentProcessedData.bestMatch);
    
  } catch (error: unknown) {
    // Abortos programados y caducidades
    if (error === "TIMEOUT" && fetchManager.isCurrent(reqId)) {
      showError("La conexión ha caducado por falta de respuesta del servidor (Timeout).");
      return;
    }
    // Si fue manual por nueva búsqueda, nos salimos
    if (error instanceof Error && error.name === 'AbortError') return;
    
    if (fetchManager.isCurrent(reqId)) {
      showError(error instanceof Error ? error.message : "Error desconocido");
    }
  } finally {
    // CORRECCIÓN: Timeout limpio en finally usando el Manager
    fetchManager.finishRequest(timeoutId);
    if (fetchManager.isCurrent(reqId)) {
      searchBtn.disabled = false;
    }
  }
}

searchBtn.addEventListener('click', executeSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') executeSearch();
});