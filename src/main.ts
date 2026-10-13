import { searchExoplanet } from './api';
import { showLoading, showError, clearMessage, renderPlanet } from './ui';

const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

// Escuchamos el clic y disparamos la petición
searchBtn.addEventListener('click', async () => {
  const query = searchInput.value.trim();
  
  if (!query) {
    showError("Por favor, escribe el nombre de un exoplaneta.");
    return;
  }

  try {
    showLoading(`Buscando "${query}" en los archivos de la NASA...`);
    
    // Pedimos a la API solo lo que necesitamos
    const resultados = await searchExoplanet(query);

    if (resultados.length === 0) {
      showError(`El exoplaneta "${query}" no se ha encontrado.`);
      return;
    }

    clearMessage();
    // Renderizamos el primer planeta que coincida con la búsqueda
    renderPlanet(resultados[0]);
    
  } catch (error) {
    if (error instanceof Error) {
      showError(error.message);
    }
  }
});