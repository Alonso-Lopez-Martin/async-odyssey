// src/main.ts
import { getRoverPhotos } from './api';
import { renderLoading, renderError, renderPhotos } from './ui';

const solSlider = document.getElementById("sol-slider") as HTMLInputElement;
const solValor = document.getElementById("sol-valor") as HTMLSpanElement;
const cameraSelect = document.getElementById("camera-select") as HTMLSelectElement;

// Función asíncrona principal orquestadora[cite: 111]
async function loadTelemetry(): Promise<void> {
  const sol = solSlider.value;
  const camera = cameraSelect.value;

  renderLoading(); // Mostramos el estado de carga antes de pedir datos[cite: 112]

  try {
    const photos = await getRoverPhotos(sol, camera); // Pausamos hasta recibir los datos[cite: 111]
    renderPhotos(photos); // Pintamos los datos[cite: 112]
  } catch (error) {
    // Si la promesa se rechaza, capturamos el error[cite: 111, 115]
    if (error instanceof Error) {
      renderError(error.message);
    } else {
      renderError("Error desconocido en la transmisión.");
    }
  }
}

// EVENTOS DEL DOM[cite: 84]
// 1. Evento 'input': Actualiza el numerito naranja en tiempo real mientras el usuario arrastra el deslizador[cite: 84]
solSlider.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  solValor.textContent = target.value;
});

// 2. Evento 'change': Dispara la petición a la NASA solo cuando el usuario SUELTA el deslizador[cite: 84]
solSlider.addEventListener("change", () => {
  loadTelemetry();
});

// 3. Evento 'change': Dispara la petición si el usuario elige otra cámara en el desplegable[cite: 84]
cameraSelect.addEventListener("change", () => {
  loadTelemetry();
});

// Llamada inicial para que la página no esté vacía al abrirla por primera vez
loadTelemetry();