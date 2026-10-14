import { searchExoplanet } from './api';
import { showLoading, showError, clearMessage, renderPlanet } from './ui';
import type { Exoplanet } from './api';

const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

// Corrección: AbortController para cancelar peticiones de búsqueda que se solapen
let currentController: AbortController | null = null;

async function executeSearch() {
  const query = searchInput.value.trim();
  
  if (!query) {
    showError("Por favor, escribe el nombre de un exoplaneta.");
    return;
  }

  // Cancelar petición anterior si la hubiera
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();

  try {
    // Desactivamos el botón para evitar doble clic
    searchBtn.disabled = true;
    showLoading(`Buscando "${query}" en los archivos de la NASA...`);
    
    const resultados = await searchExoplanet(query, currentController.signal);

    if (resultados.length === 0) {
      showError(`El exoplaneta "${query}" no se ha encontrado.`);
      return;
    }

    // CORRECCIÓN TRANSFORMACIONES ARRAY (filter, reduce, sort, map)
    
    // 1. Filter: Quitamos entradas residuales de la base de datos sin nombre
    const resultadosValidos = resultados.filter(p => p.pl_name && p.pl_name.trim() !== '');

    // 2. Reduce (Deduplicación): La NASA a veces devuelve el mismo planeta de distintos papers.
    const planetasUnicos = resultadosValidos.reduce((acc: Exoplanet[], current) => {
      const existe = acc.find(item => item.pl_name.toLowerCase() === current.pl_name.toLowerCase());
      if (!existe) acc.push(current);
      return acc;
    }, []);

    // 3. Sort: Los ordenamos por año de hallazgo (del más antiguo al más reciente)
    planetasUnicos.sort((a, b) => (a.disc_year || 0) - (b.disc_year || 0));

    // 4. Reduce (Agrupación): Contamos los métodos de descubrimiento para mostrar estadísticas
    const metodosCount = planetasUnicos.reduce((acc: Record<string, number>, p) => {
      const metodo = p.discoverymethod || 'Desconocido';
      acc[metodo] = (acc[metodo] || 0) + 1;
      return acc;
    }, {});

    // 5. Map: Formateamos ese conteo en un string legible con un map y un join
    const statsArray = Object.entries(metodosCount).map(([metodo, count]) => `${metodo}: ${count}`);
    const metadataHtml = `<p style="color: #00d2ff; font-size: 0.9em; margin-bottom: 10px;">
      Resultados relacionados encontrados: ${planetasUnicos.length}. <br> 
      Métodos en este sector: ${statsArray.join(' | ')}.
    </p>`;

    clearMessage();
    // Pintamos el mejor match (el primero tras ordenar) pasándole también las estadísticas procesadas
    renderPlanet(planetasUnicos[0], metadataHtml);
    
  } catch (error: any) {
    // Ignoramos el error si fue provocado por una cancelación manual del AbortController
    if (error.name === 'AbortError') return;
    
    // Mostramos error general limpiando siempre la carga
    const mensajeError = error instanceof Error ? error.message : String(error);
    showError(mensajeError);
  } finally {
    // Rehabilitar el botón
    searchBtn.disabled = false;
  }
}

// Soporte para botón Buscar
searchBtn.addEventListener('click', executeSearch);

// Corrección: Soporte para tecla Enter
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    executeSearch();
  }
});